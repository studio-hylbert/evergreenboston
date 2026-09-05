/**
 * Lists the church's images folder as JSON, for the site build to read.
 *
 * This lives in the church's Google Drive rather than in this repository, and
 * is kept here only so the source is version-controlled rather than existing
 * solely inside a Google web editor. Paste it into script.google.com; see
 * README.md, '사진 갤러리'.
 *
 * Deployed as a web app with:
 *   Execute as:      Me                (webapp.executeAs  = USER_DEPLOYING)
 *   Who has access:  Anyone            (webapp.access     = ANYONE_ANONYMOUS)
 *
 * So the build fetches a plain URL with no credentials — the same shape as the
 * YouTube feed, and with the same property that there is no secret to hand over
 * with the site.
 *
 * This returns metadata only. It does not serve image bytes: the gallery folder
 * is shared link-readable, so the refresh script fetches each photo straight
 * from Google's CDN at the size it wants
 * (drive.google.com/thumbnail?id=<id>&sz=w1600). An earlier version base64'd the
 * originals through here and was measured at 88 seconds for one 1.4 MB photo,
 * with one attempt in three timing out; the CDN answers the same photo, already
 * resized, in half a second. Apps Script is a poor place to move megabytes.
 *
 * Configuration is a script property rather than a constant here, so the folder
 * can be changed without editing code:
 *   Project Settings -> Script Properties -> GALLERY_FOLDER_ID = <folder id>
 */

/** Files we are willing to publish. Anything else in a folder is ignored. */
var IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

function doGet() {
  try {
    return json_({ sections: listSections_() });
  } catch (err) {
    // Reported as JSON with ok:false so a failure can never be mistaken for an
    // empty gallery — which would otherwise read as "the church deleted every
    // photo" and quietly empty the site.
    //
    // The message is deliberately fixed rather than the exception text, since
    // this endpoint is open to the internet and runs as the account that
    // deployed it. The real reason goes to the execution log, which only the
    // owner sees.
    console.error(err);
    return json_({ ok: false, error: "Request failed. See the Apps Script execution log." });
  }
}

function rootFolder_() {
  var id = PropertiesService.getScriptProperties().getProperty("GALLERY_FOLDER_ID");
  if (!id) {
    throw new Error("Script property GALLERY_FOLDER_ID is not set.");
  }
  return DriveApp.getFolderById(id);
}

/**
 * The folder is two levels deep.
 *
 *   News_소식/                     ← section, one per part of the site
 *     Korean School Fall_한국학교 가을학기/   ← item
 *       poster.jpg
 *   Gallery_사진첩/
 *     Christmas_성탄절/
 *       *.jpg
 *
 * A poster announcing next term and a set of photographs from a potluck are
 * both "images in a folder", but they are not the same thing to a reader: one
 * is being told to you, the other is being kept for you. The two sections are
 * that distinction, and the level below them is what the church adds to.
 *
 * Every name — sections included — follows `English_한국어`, and every name is
 * passed through untouched for scripts/refresh-gallery.mjs to split.
 */
function listSections_() {
  var sections = [];
  var folders = rootFolder_().getFolders();

  while (folders.hasNext()) {
    var folder = folders.next();
    if (isHidden_(folder.getName())) {
      continue;
    }
    sections.push({
      name: folder.getName(),
      items: listItems_(folder),
      // Photos dropped straight into a section rather than into one of its
      // folders. They cannot be published — an item's titles come from its
      // folder's name, so loose files have nowhere to take a title from — and
      // silently ignoring them would leave someone waiting for photos that
      // were never going to appear. Reported so the refresh job can say so.
      loose: listPhotos_(folder).length,
    });
  }

  return sections.sort(byName_);
}

function listItems_(section) {
  var items = [];
  var folders = section.getFolders();

  while (folders.hasNext()) {
    var folder = folders.next();
    if (isHidden_(folder.getName())) {
      continue;
    }
    items.push({
      name: folder.getName(),
      modified: folder.getLastUpdated().toISOString(),
      photos: listPhotos_(folder),
    });
  }

  // Stable order, so an unchanged gallery produces a byte-identical response
  // and the refresh job can tell "nothing changed" from "something changed".
  return items.sort(byName_);
}

/**
 * A folder whose name starts with `_` is passed over, at any level.
 *
 * Taking something off the site should not mean deleting it. Renaming a folder
 * to `_Korean School_한국학교`, or dragging it into an `_Old` folder, retires it
 * while the photographs stay where the church put them.
 *
 * It has to be a marked, deliberate act rather than "anything we don't
 * recognise": an unknown folder is far more often a typo — `Galery_사진첩` — and
 * quietly ignoring that would make photos vanish for a reason nobody could see.
 * One rule, one character, and it reads the same way at every level.
 */
function isHidden_(name) {
  return name.charAt(0) === "_";
}

function byName_(a, b) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

function listPhotos_(folder) {
  var photos = [];
  var files = folder.getFiles();

  while (files.hasNext()) {
    var file = files.next();
    if (IMAGE_TYPES.indexOf(file.getMimeType()) === -1) {
      continue;
    }
    photos.push({
      id: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      bytes: file.getSize(),
      modified: file.getLastUpdated().toISOString(),
    });
  }

  photos.sort(function (a, b) {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });

  return photos;
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON
  );
}

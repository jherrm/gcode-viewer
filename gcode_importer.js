function FileIO() { }

FileIO.error = function(msg) {
  alert(msg);
}

FileIO.loadPath = function(path, callback) {
  var self = this;
  $.get(path, null, callback, 'text')
    .error(function() { self.error('Unable to load gcode.') });
}

FileIO.load = function(files, callback) {
  if (files.length) {
    var i = 0, l = files.length;
    for ( ; i < l; i++) {
      FileIO.load(files[i], callback);
    }
  }
  else {
    var reader = new FileReader();
    reader.onload = function() {
      callback(reader.result);
    };
    reader.readAsText(files);
  }
}

///////////////////////////////////////////////////////////////////////////////

function GCodeImporter() { }

GCodeImporter.importPath = function(path, callback) {
  FileIO.loadPath(path, function(gcode) {
    GCodeImporter.importText(gcode, callback);
  });
}

GCodeImporter.importText = function(gcode, callback) {
  var gcodeModel = gcode; // TODO: actually get the model
  callback(gcodeModel);
}

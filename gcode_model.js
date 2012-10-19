function GCodeModel() {
  this.codes = [];
};

GCodeModel.prototype.toString = function() {
  var self = this,
      output = "";
  self.codes.forEach(function(code) {
    output += code.toString() + "\n";
  });
  return output;
};

function GCode() {
  this.words = [];
  this.comments = [];
  // this.lineNumbers = [];
  this.index = 0;
};

GCode.prototype.toString = function() {
  var self = this,
      output = "";

  if(self.comments.length > 0) {
    output = self.comments.join(' ') + "\n";
  }

  self.words.forEach(function(word) {
    output += word.toString() + "\n";
  });

  return output;
};

function GWord(letter, value, raw) {
  this.letter = letter;
  this.value = value;
  this.raw = raw;
};

GWord.prototype.toString = function() {
  return this.letter + ":" + this.value + " (" + this.raw + ")";
};

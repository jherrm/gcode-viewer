function GCodeViewModel(code) {
  this.code = code;
  this.vertexIndex = 0;
  this.vertexLength = 0;
}

function GCodeRenderer() {

  var self = this;

  this.viewModels = [];
  this.index = 0;
  this.baseObject = new THREE.Object3D();

  this.motionGeo = new THREE.Geometry();
  this.motionMat = new THREE.LineBasicMaterial({
        opacity: 0.2,
        transparent: true,
        linewidth: 1,
        vertexColors: THREE.VertexColors });

  this.motionIncGeo = new THREE.Geometry();
  this.motionIncMat = new THREE.LineBasicMaterial({
        opacity: 0.2,
        transparent: true,
        linewidth: 1,
        vertexColors: THREE.VertexColors });

  this.feedAllGeo = new THREE.Geometry();

  this.feedGeo = new THREE.Geometry();
  this.feedMat = new THREE.LineBasicMaterial({
        opacity: 0.8,
        transparent: true,
        linewidth: 2,
        vertexColors: THREE.VertexColors });

  this.feedIncGeo = new THREE.Geometry();
  this.feedIncMat = new THREE.LineBasicMaterial({
        opacity: 0.2,
        transparent: true,
        linewidth: 2,
        vertexColors: THREE.VertexColors });

  this.lastLine = {x:0, y:0, z:0, e:0, f:0};
  this.relative = false;

  // this.renderer = renderer;
  this.bounds = {
    min: { x: 100000, y: 100000, z: 100000 },
    max: { x:-100000, y:-100000, z:-100000 }
  };

  this.geometryHandlers = {

    G0: function(viewModel) {
      // console.log("in g0 renderer handler " + code)

      var newLine = {};

      viewModel.code.words.forEach(function(word) {
        // TODO: handle non-numerical values
        switch(word.letter) {
          case 'X': case 'Y': case 'Z':  case 'E':  case 'F':
            var p = word.letter.toLowerCase();
            newLine[p] = self.absolute(self.lastLine[p], parseFloat(word.value));
            break;
        }
      });

      ['x','y','z','e','f'].forEach(function(prop) {
        if (newLine[prop] === undefined) {
          newLine[prop] = self.lastLine[prop];
        }
      });

      viewModel.vertexIndex = self.motionGeo.vertices.length;

      // var color =  new THREE.Color(GCodeRenderer.motionColors[viewModel.code.index%GCodeRenderer.motionColors.length]);
      var color =  GCodeRenderer.motionColors[viewModel.code.index%GCodeRenderer.motionColors.length];
      self.motionGeo.vertices.push(new THREE.Vector3(self.lastLine.x, self.lastLine.y, self.lastLine.z));
      self.motionGeo.vertices.push(new THREE.Vector3(newLine.x, newLine.y, newLine.z));

      self.motionGeo.colors.push(color);
      self.motionGeo.colors.push(color);

      viewModel.vertexLength = self.motionGeo.vertices.length - viewModel.vertexIndex;

      self.lastLine = newLine;

      return self.motionGeo;
    },
    G1: function(viewModel) {
      // console.log("in g1 renderer handler " + viewModel.code)

      var newLine = {};

      viewModel.code.words.forEach(function(word) {
        // TODO: handle non-numerical values
        switch(word.letter) {
          case 'X': case 'Y': case 'Z':  case 'E':  case 'F':
            var p = word.letter.toLowerCase();
            newLine[p] = self.absolute(self.lastLine[p], parseFloat(word.value));
            break;
        }
      });

      ['x','y','z','e','f'].forEach(function(prop) {
        if (newLine[prop] === undefined) {
          newLine[prop] = self.lastLine[prop];
        }
      });

      // var color =  new THREE.Color(GCodeRenderer.feedColors[viewModel.code.index%GCodeRenderer.feedColors.length]);
      var color =  GCodeRenderer.feedColors[viewModel.code.index%GCodeRenderer.feedColors.length];
      var p1 = new THREE.Vector3(self.lastLine.x, self.lastLine.y, self.lastLine.z);
      var p2 = new THREE.Vector3(newLine.x, newLine.y, newLine.z);

      viewModel.vertexIndex = self.feedAllGeo.vertices.length;

      if( viewModel.code.index <= self.index ) {
        self.feedGeo.vertices.push(p1);
        self.feedGeo.vertices.push(p2);
        self.feedGeo.colors.push(color);
        self.feedGeo.colors.push(color);
      }
      else {
        self.feedIncGeo.colors.push(color);
        self.feedIncGeo.colors.push(color);
        self.feedIncGeo.vertices.push(p1);
        self.feedIncGeo.vertices.push(p2);
      }

      self.feedAllGeo.vertices.push(p1);
      self.feedAllGeo.vertices.push(p2);
      self.feedAllGeo.colors.push(color);
      self.feedAllGeo.colors.push(color);

      viewModel.vertexLength = self.feedAllGeo.vertices.length - viewModel.vertexIndex;

      self.lastLine = newLine;

      return self.feedGeo;
    },
    G2: function(viewModel) {
    }

  } // end geometryHandlers

  this.materialHandlers = {

    G0: function(viewModel) {
      return this.motionMat;
    },
    G1: function(viewModel) {
      return this.feedMat;
    },
    G2: function(viewModel) {
      return this.feedMat;
    }

  } // end materialHandlers

};

GCodeRenderer.motionColors = [ new THREE.Color(0xdddddd) ]
GCodeRenderer.feedColors = [
                             // new THREE.Color(0xffcc66), // canteloupe
                             new THREE.Color(0x66ccff), // sky
                             new THREE.Color(0x22bb22), // honeydew
                             // new THREE.Color(0xff70cf), // carnation
                             new THREE.Color(0xcc66ff), // lavender
                             new THREE.Color(0xfffe66), // banana
                             new THREE.Color(0xff6666) // salmon
                             // new THREE.Color(0x66ffcc), // spindrift
                             // new THREE.Color(0x66ff66), // flora
                           ]

GCodeRenderer.prototype.absolute = function(v1, v2) {
    return this.relative ? v1 + v2 : v2;
  }

GCodeRenderer.prototype.render = function(model) {
  var self = this;
  self.model = model;

  self.model.codes.forEach(function(code) {
    self.renderGCode(code);
  });

  self.updateLines();

  // Center
  self.feedAllGeo.computeBoundingBox();
  self.bounds = self.feedAllGeo.boundingBox;

  self.center = new THREE.Vector3(
      self.bounds.min.x + ((self.bounds.max.x - self.bounds.min.x) / 2),
      self.bounds.min.y + ((self.bounds.max.y - self.bounds.min.y) / 2),
      self.bounds.min.z + ((self.bounds.max.z - self.bounds.min.z) / 2));

  var zScale = window.innerHeight / (self.bounds.max.z - self.bounds.min.z),
      yScale = window.innerWidth / (self.bounds.max.y - self.bounds.min.y),
      xScale = window.innerWidth / (self.bounds.max.x - self.bounds.min.x),

      scale = Math.min(zScale, Math.min(xScale, yScale));

  self.baseObject.position = self.center.multiplyScalar(-scale);
  self.baseObject.scale.multiplyScalar(scale);

  return self.baseObject;
};

GCodeRenderer.prototype.updateLines = function() {
  var self = this;

  while( self.baseObject.children.length > 0 ) {
    self.baseObject.remove(self.baseObject.children[0]);
  }

  var motionLine = new THREE.Line(this.motionGeo, this.motionMat, THREE.LinePieces);
  var feedLine = new THREE.Line(this.feedGeo, this.feedMat, THREE.LinePieces);
  var feedIncLine = new THREE.Line(this.feedIncGeo, this.feedIncMat, THREE.LinePieces);
  self.baseObject.add(motionLine);
  self.baseObject.add(feedLine);
  self.baseObject.add(feedIncLine);
};

/* returns THREE.Object3D */
GCodeRenderer.prototype.renderGCode = function(code) {
  var cmd = code.words[0].letter+code.words[0].value;
  var viewModel = new GCodeViewModel(code);

  var geometryHandler = this.geometryHandlers[cmd] || this.geometryHandlers['default'];
  if (geometryHandler) {
    geometryHandler(viewModel);
  }
  var materialHandler = this.materialHandlers[cmd] || this.materialHandlers['default'];
  if (materialHandler) {
    materialHandler(viewModel);
  }

  if(viewModel.vertexLength > 0) {
    this.viewModels.push(viewModel);
  }
};


GCodeRenderer.prototype.setIndex = function(index) {
  index = Math.floor(index);
  if( this.index == index ) { return; }
  if( index < 0 || index >= this.viewModels.length ) {
    throw new Error("invalid index");
  }

  var vm = this.viewModels[index];

  this.feedGeo = new THREE.Geometry();

  var vertices = this.feedAllGeo.vertices.slice(0, vm.vertexIndex + vm.vertexLength);
  Array.prototype.push.apply( this.feedGeo.vertices, vertices );

  var colors = this.feedAllGeo.colors.slice(0, vm.vertexIndex + vm.vertexLength);
  Array.prototype.push.apply( this.feedGeo.colors, colors );


  this.index = index;
  this.updateLines();
};

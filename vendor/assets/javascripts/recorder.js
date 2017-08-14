(function(window){
  var WORKER_PATH = 'recorderWorker.js';
  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        descriptor.writable = ("value" in descriptor);
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Recorder = function () {
    function Recorder(source, cfg) {
      var self = this;
      this.config = {
        bufferLen: 4096,
        numChannels: 2,
        mimeType: 'audio/wav',
        workerPath: WORKER_PATH
      };
      this.recording = false;
      this.callbacks = {
        getBuffer: [],
        exportWAV: []
      };

      Object.assign(this.config, cfg);
      this.context = source.context;
      this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(this.context, this.config.bufferLen, this.config.numChannels, this.config.numChannels);

      this.node.onaudioprocess = function (e) {
        if (!self.recording) return;

        var buffer = [];
        for (var channel = 0; channel < self.config.numChannels; channel++) {
          buffer.push(e.inputBuffer.getChannelData(channel));
        }
        self.worker.postMessage({
          command: 'record',
          buffer: buffer
        });
      };

      source.connect(this.node);
      this.node.connect(this.context.destination); //this should not be necessary

      this.worker = new Worker(this.config.workerPath);

      this.worker.postMessage({
        command: 'init',
        config: {
          sampleRate: this.context.sampleRate,
          numChannels: this.config.numChannels
        }
      });

      this.worker.onmessage = function (e) {
        var cb = self.callbacks[e.data.command].pop();
        if (typeof cb == 'function') {
          cb(e.data.data);
        }
      };
    }

    _createClass(Recorder, [{
      key: 'record',
      value: function record() {
        this.recording = true;
      }
    }, {
      key: 'stop',
      value: function stop() {
        this.recording = false;
      }
    }, {
      key: 'clear',
      value: function clear() {
        this.worker.postMessage({ command: 'clear' });
      }
    }, {
      key: 'getBuffer',
      value: function getBuffer(cb) {
        cb = cb || this.config.callback;
        if (!cb) throw new Error('Callback not set');

        this.callbacks.getBuffer.push(cb);

        this.worker.postMessage({ command: 'getBuffer' });
      }
    }, {
      key: 'exportWAV',
      value: function exportWAV(cb, mimeType) {
        mimeType = mimeType || this.config.mimeType;
        cb = cb || this.config.callback;
        if (!cb) throw new Error('Callback not set');

        this.callbacks.exportWAV.push(cb);

        this.worker.postMessage({
          command: 'exportWAV',
          type: mimeType
        });
      }
    }], [{
      key: 'forceDownload',
      value: function forceDownload(blob, filename) {
        var url = (window.URL || window.webkitURL).createObjectURL(blob);
        var link = window.document.createElement('a');
        link.href = url;
        link.download = filename || 'output.wav';
        var click = document.createEvent("Event");
        click.initEvent("click", true, true);
        link.dispatchEvent(click);
      }
    }]);

    return Recorder;
  }();

  window.Recorder = Recorder;

})(window);

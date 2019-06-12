(function(site, undefined) {
  'use strict';
  var ageGate = site.ageGate;
  /*
      // Cache Modules
      var trace = site.utilities.trace,
          track = site.utilities.track,
          validate = site.utilities.validate,
          queueProgress = site.utilities.queueProgress,
          dialog = site.ui.dialog,
          radialProgress = site.ui.radialProgress,
          slidingGallery = site.ui.slidingGallery,
          tutorial = site.ui.tutorial,
          vidModal = site.ui.vidModal;
  */

  // public methods and properties
  site.init = function() {
    ageGate.init('age-gate-form');
  };

  /*
      // private methods
      function speak(msg) {
          console.log( "You said: " + msg );
      };
  */

  // fire on DOM ready
  $(function() {
    site.init();
  });
})((window.site = window.site || {}));

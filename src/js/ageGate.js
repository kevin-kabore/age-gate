(function(site, undefined) {
  'use strict';

  // private variables
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'November',
    'December'
  ];

  const OLDEST_PERSON_ALIVE = 116;

  let monthSelect, yearSelect, d, currentYear;

  /**
   * [Public method to initialize ageGate module with parameters]
   * @param  {[string]} formId   [html form to append html inputs to]
   * @param  {[number]} legalAge [age for validation]
   */
  function init(formId, legalAge) {
    console.log('[ageGate]: init');
    monthSelect = document.querySelector(`#${formId} select[name="month"]`);
    yearSelect = document.querySelector(`#${formId} select[name="year"]`);
    d = new Date();
    currentYear = d.getFullYear();

    setFormInputs();
  }

  /**
   * [setFormInputs sets date options]
   */
  let setFormInputs = () => {
    months.forEach(m => {
      let monthOption = document.createElement('option');

      monthOption.setAttribute('value', `"${m}"`);
      monthOption.innerHTML = m;
      monthSelect.appendChild(monthOption);
    });

    for (let i = currentYear; i >= currentYear - OLDEST_PERSON_ALIVE; i--) {
      let yearOption = document.createElement('option');

      yearOption.setAttribute('value', `"${i}"`);
      yearOption.innerHTML = i;
      yearSelect.appendChild(yearOption);
    }
  };

  // public methods and properties
  site.ageGate = {
    init: init
  };
})((window.site = window.site || {}));

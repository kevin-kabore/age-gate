(function(site) {
  'use strict';

  /**
   * Private Variables
   */
  const OLDEST_PERSON_ALIVE = 116,
    months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

  let ageRequired, ageGateHolder, d, currentYear;

  /**
   * [Public method to initialize ageGate module with parameters]
   * @param  {[string]} formId   [html form to append html inputs to]
   * @param  {[number]} legalAge [age for validation]
   */

  function init(ageRequired) {
    console.log('[ageGate]: init');

    getCookie('is_of_age');

    ageRequired = ageRequired;
    ageGateHolder = document.getElementById('age-gate-holder');

    d = new Date();
    currentYear = d.getFullYear();

    setForm(ageRequired);
  }

  /**
   * [setForm creates and appends form to #age-gate-holder]
   */
  const setForm = ageRequired => {
    let fragment = document.createDocumentFragment(),
      form = document.createElement('form'),
      monthSelect = document.createElement('select'),
      yearSelect = document.createElement('select'),
      submitBtn = document.createElement('input');

    form.id = 'age-gate-form';

    monthSelect.name = 'month';
    monthSelect.className = 'month';

    yearSelect.name = 'year';
    yearSelect.className = 'year';

    submitBtn.type = 'submit';
    submitBtn.value = 'Enter';

    fragment.appendChild(form);
    form.appendChild(monthSelect);
    form.appendChild(yearSelect);
    form.appendChild(submitBtn);

    /**
     * Iterate over months and append options
     */
    months.forEach((m, i) => {
      let monthOption = document.createElement('option');

      monthOption.value = i;
      monthOption.innerHTML = m;
      monthSelect.appendChild(monthOption);
    });

    /**
     * Iterate from currentYear down to max year + 1
     */
    for (let i = currentYear; i >= currentYear - OLDEST_PERSON_ALIVE; i--) {
      let yearOption = document.createElement('option');

      yearOption.value = i;
      yearOption.innerHTML = i;
      yearSelect.appendChild(yearOption);
    }

    setSubmitListener(form, ageRequired);

    ageGateHolder.appendChild(fragment);
  };

  /**
   * [setSubmitListener adds Listener and fires isAgeValid method with form data]
   * @param {[HTMLElement]} form [description]
   */
  const setSubmitListener = (form, ageRequired) => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      let month = e.target.querySelector('select[name="month"]');
      let year = e.target.querySelector('select[name="year"]');
      let monthInt = parseInt(month.value);
      let yearInt = parseInt(year.value);

      setAgeCookie(isAgeValid(ageRequired, monthInt, yearInt));
    });
  };

  /**
   * [isAgeValid checks if age is >== legal age]
   * @param  {[number]}  ageRequired [minimum age required in years]
   * @param  {[number]}  month       [month 0-11]
   * @param  {[number]}  year
   * @return {Boolean}             [true if > ageRequired : false]
   */
  const isAgeValid = (ageRequired, month, year) => {
    let currentDate = new Date(),
      userLegalDate = new Date(year + ageRequired, month);

    // check if user's legal date is before or equal to today
    return userLegalDate <= currentDate ? true : false;
    // return userLegalDate <= currentDate;
  };

  /**
   * [setAgeCookie sets is_of_age cookie]
   * @param {Boolean} isAgeValid [Boolean to determine cookie value]
   */
  const setAgeCookie = isAgeValid => {
    return isAgeValid
      ? (document.cookie = 'is_of_age=true')
      : (document.cookie = 'is_of_age=false');
  };

  /**
   * [getCookie description]
   * @param  {[string]} cookieString [cookie's key]
   * @return {[string]}  [found cookie's value if cookie found]
   */
  const getCookie = cookieString => {
    let cookies = `; ${document.cookie}`;
    let cookiesArray = cookies.split('; ');

    cookiesArray.forEach(c => {
      if (c !== '') {
        let [key, value] = c.split('=');
        if (key === cookieString) {
          return value;
        }
      }
    });
  };

  // public methods and properties
  // (site.ageGate = {
  //   init: init
  // });

  /**
   * self init on DOM loaded, with optional ageRequirement
   */
  (() => {
    window.addEventListener('DOMContentLoaded', () => {
      init(21);
    });
  })();
})((window.site = window.site || {}));

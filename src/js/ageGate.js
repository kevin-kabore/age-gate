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
    ],
    cookieName = 'is_of_age';

  let ageRequired,
    ageGateView,
    ageGateFormHolder,
    d,
    currentYear,
    userAgeCookie;

  /**
   * [init() Public method to initialize ageGate module with parameters]
   * @param  {[number]} ageRequired [RequiredAge for validation]
   */
  function init(ageRequired = 21) {
    deleteCookie(cookieName);
    console.log('[ageGate]: init with minimum age: ' + ageRequired);

    ageRequired = ageRequired;
    d = new Date();
    currentYear = d.getFullYear();

    ageGateView = document.getElementById('age-gate');
    ageGateFormHolder = document.getElementById('age-gate-form-holder');

    userAgeCookie = getCookie(cookieName);
    if (userAgeCookie) {
      validateCookieAndDisplay(userAgeCookie);
    }

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

    submitBtn.type = 'button';
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

    setSubmitListener(submitBtn, ageRequired);

    ageGateFormHolder.appendChild(fragment);
  };

  /**
   * [setSubmitListener adds Listener and fires which fires isAgeValid method with form data]
   * @param {[HTMLElement]} submitBtn [input[type="button"] HTML element]
   */
  const setSubmitListener = (submitBtn, ageRequired) => {
    submitBtn.addEventListener('click', e => {
      e.preventDefault();

      console.log('click');

      let month = document.querySelector('#age-gate-form select[name="month"]');
      let year = document.querySelector('#age-gate-form select[name="year"]');
      let monthInt = parseInt(month.value);
      let yearInt = parseInt(year.value);

      console.log(monthInt);
      console.log(yearInt);

      let boolean = isAgeValid(ageRequired, monthInt, yearInt);
      setIsOfAgeCookie(boolean);

      userAgeCookie = getCookie(cookieName);
      validateCookieAndDisplay(userAgeCookie);
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
   * [setIsOfAgeCookie sets is_of_age cookie]
   * @param {Boolean} isAgeValid [Boolean to determine cookie value]
   */
  const setIsOfAgeCookie = isAgeValid => {
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
    let cookieVal = null;

    cookiesArray.forEach(c => {
      if (c !== '') {
        let [key, value] = c.split('=');

        if (key === cookieString) {
          cookieVal = value;
        }
      }
    });

    return cookieVal;
  };

  /**
   * [validateCookieAndDisplay validates cookie and hides ageGate]
   * @param  {[string]} cookieVal [cookieValue]
   */
  const validateCookieAndDisplay = cookieVal => {
    if (cookieVal && cookieVal === 'true') {
      ageGateView.classList.add('hide');
    } else if (cookieVal === 'false') {
      document.querySelector('#age-gate div.footer').innerHTML =
        'I AM NOT OF LEGAL DRINKING AGE';
    }
  };

  /**
   * [deleteCookie deletes cookie of key cookieName]
   * @param  {[string]} cookieName [description]
   */
  const deleteCookie = cookieName => {
    document.cookie = `${cookieName}= ; expires Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  // public methods and properties
  site.ageGate = {
    init: init
  };

  /**
   * self init on DOM loaded, with optional ageRequirement
   */
  (() => {
    window.addEventListener('DOMContentLoaded', () => {
      init();
    });
  })();
})((window.site = window.site || {}));

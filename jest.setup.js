require('@testing-library/jest-dom');

// Mock Google Apps Script environment
global.google = {
  script: {
    run: {
      withSuccessHandler: (fn) => ({
        withFailureHandler: () => ({
          validateUserAccess: () => fn()
        })
      })
    }
  }
};

// Mock HTML elements
document.body.innerHTML = `
  <div id="main-content"></div>
  <div id="navigation"></div>
`;
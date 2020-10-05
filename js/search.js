import debounce from './utils/debounce.js'

export default class Search {
  constructor() {
    if (!this.setVars()) return;

    this.setEvents();
  }

  setVars() {
    this.selectors = {
      searchInput:         "[data-search-input]",
      searchButton:        "[data-search-button]",
      replaceInput:        "[data-replace-input]",
      replaceSingleButton: "[data-replace-single-button]",
      replaceAllButton:    "[data-replace-all-button]",
      results:             "[data-search-results]",
      button:              ".search__button",
      highlightedItem:     ".searchmatch",
    };

    this.searchInput = document.querySelector(this.selectors.searchInput);
    this.searchButton = document.querySelector(this.selectors.searchButton);
    this.buttons = document.querySelectorAll(this.selectors.button);
    this.replaceInput = document.querySelector(this.selectors.replaceInput);
    this.replaceSingleButton = document.querySelector(
      this.selectors.replaceSingleButton
    );
    this.replaceAllButton = document.querySelector(
      this.selectors.replaceAllButton
    );
    this.results = document.querySelector(this.selectors.results);
    this.highlightedItem = document.querySelector(this.selectors.highlightedItem);
    this.value = '';
    this.searchResults = [];

    this.proxy = "https://cors-anywhere.herokuapp.com/";

    this.loader = `<div class="loading"></div>`;

    this.classes = {
      resultItemTitle: 'search__resultTitle',
      resultItemBody:  'search__result',
    }
    return true;
  }

  setEvents() {
    this.fetchData = this.fetchData.bind(this);
    this.runSearch = this.runSearch.bind(this);
    this.getReplaceValue = this.getReplaceValue.bind(this);
    this.singleReplace = this.singleReplace.bind(this);
    this.allReplace = this.allReplace.bind(this);
    this.enableButtons = this.enableButtons.bind(this);
    this.enableReplaceInput = this.enableReplaceInput.bind(this);

    this.searchInput.addEventListener("input", debounce(this.runSearch, 2000));
    this.replaceInput.addEventListener("input", this.getReplaceValue);
    this.searchButton.addEventListener("click", this.runSearch);
    this.replaceSingleButton.addEventListener("click", this.singleReplace);
    this.replaceAllButton.addEventListener("click", this.allReplace);
  }

  runSearch() {
    const searchValue = this.searchInput.value;
    this.value = searchValue;
    if (this.value === '') return;
    this.fetchData(this.value);
  }

  fetchData(value) {
    this.results.innerHTML = this.loader;
    fetch(`${this.proxy}https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${value}&srlimit=10`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let items = data.query.search;
        this.results.innerHTML = "";

        items.forEach((item) => {
          const resultItemBody = document.createElement("li");
          const resultItemTitle = document.createElement("h2");
          resultItemTitle.className = this.classes.resultItemTitle;
          resultItemBody.className = this.classes.resultItemBody;
          resultItemBody.innerHTML = item.snippet;
          resultItemTitle.innerHTML = item.title;
          resultItemBody.prepend(resultItemTitle);
          this.results.appendChild(resultItemBody);
          this.searchResults = this.results;
        });
        this.enableReplaceInput();
      })
      .catch((error) => {
        this.results.innerHTML = `<p class="search__results search__results--error">
                                    Sorry no results...try again</p>`;
        console.error("Error:", error);
      });

      return this.searchResults;
  }

  getReplaceValue() {
    this.value = this.replaceInput.value;
    if ( this.value !== '' ) {
      this.enableButtons();
    }
  }

  enableButtons() {
    this.buttons.forEach((button) => {
      button.disabled = false;
    });
  }

  enableReplaceInput() {
    this.replaceInput.disabled = false;
  }

  singleReplace() {
    this.getReplaceValue();
    if (this.value === '') return;
    if (!this.searchResults) return;
    let item = this.searchResults.children[0];
    item = item.querySelector(this.selectors.highlightedItem);
    item.innerHTML = this.value;
  }

  allReplace() {
    this.getReplaceValue();
    if (this.value === '') return;
    if (!this.searchResults) return;
    let items = this.searchResults.querySelectorAll(this.selectors.highlightedItem);
    items.forEach((item) => {
      item.innerHTML = this.value;
    });
  }
}

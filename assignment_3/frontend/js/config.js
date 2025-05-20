/**
 * Configuration panel module with date range slider
 */
console.log("Config module loaded");

const ConfigPanel = (function () {
  // DEFAULT SETTINGS
  const default_settings = {
    nameSearchInput: "",
    subjectSearchInput: "",
    dateRange: {
      // Dates in the text boxes
      startDate: "2014-01-06",
      endDate: "2014-01-18"
    },
    limit: 500,
    visualOptions: {
      showLabels: true,
      showRelationships: false,
      nodeSize: "medium",
    },
  };

  let settings = {
    nameSearchInput: "",
    subjectSearchInput: "",
    dateRange: {
      // Dates in the text boxes
      startDate: "2014-01-06",
      endDate: "2014-01-18"
    },
    limit: 500,
    visualOptions: {
      showLabels: true,
      showRelationships: false,
      nodeSize: "medium",
    },
  };

  // Min and max dates for the range
  const MIN_DATE = "2014-01-06";
  const MAX_DATE = "2014-01-18";

  // Change callback
  let onSettingsChangeCallback = null;

  // Initialize the config panel
  function init(onSettingsChange) {
    onSettingsChangeCallback = onSettingsChange;
    renderConfigPanel();
    attachEventListeners();
  }

  // Format date for display
  function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Render the configuration panel
  function renderConfigPanel() {
    const configPanelElement = document.getElementById("configPanel");
    if (!configPanelElement) {
      console.error("Config panel element not found");
      return;
    }

    configPanelElement.innerHTML = `
      <h2 class="config-title">Configuration Panel</h2>
      
      <div class="config-section">
        <h3 class="section-title">Filter Emails by Date Range</h3>
        
        <div class="form-group">
          <label for="start-date">Start Date: </label>
          <input
            type="date"
            id="start-date"
            min="${MIN_DATE}"
            max="${settings.dateRange.endDate}"
            value="${settings.dateRange.startDate}"
            class="date-input"
          />
        </div>
        
        <div class="form-group">
          <label for="end-date">End Date: </label>
          <input
            type="date"
            id="end-date"
            min="${settings.dateRange.startDate}"
            max="${MAX_DATE}"
            value="${settings.dateRange.endDate}"
            class="date-input"
          />
        </div>
        <div class="form-group">
          <label for="limit-input">Result Limit:</label>
          <input
            type="number"
            id="limit-input"
            min="1"
            max="100000"
            value="${settings.limit}"
            class="number-input"
          />
          <div class="input-help-text">Maximum number of emails to display</div>
        </div>
      </div>

      <div class="config-section">
        <h3 class="section-title">Search:</h3>
        
        <div class="form-group">
          <label for="name-search-input">Search Email Addresses:</label>
          <input
            type="text"
            id="name-search-input"
            placeholder="Search email addresses..."
            value="${settings.nameSearchInput}"
            class="text-input"
          />
          <div class="input-help-text">Enter text to search nodes (email addresses)</div>
        </div>
                
        <div class="form-group">
          <label for="subject-search-input">Search Subjects:</label>
          <input
            type="text"
            id="subject-search-input"
            placeholder="Search email subjects..."
            value="${settings.subjectSearchInput}"
            class="text-input"
          />
        <div class="input-help-text">Enter text to search edges (email subjects)</div>
        </div>
      </div>
      <div class="config-section">
        <h3 class="section-title">Visualization Options</h3>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              id="show-labels" 
              ${settings.visualOptions.showLabels ? "checked" : ""}
            />
            Show email addresses
          </label>
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              id="show-relationships" 
              ${settings.visualOptions.showRelationships ? "checked" : ""}
            />
            Show email counts
          </label>
        </div>
        
        <div class="form-group">
          <label for="node-size">Node Size:</label>
          <select id="node-size" class="select-input">
            <option value="small" ${
              settings.visualOptions.nodeSize === "small" ? "selected" : ""
            }>Small</option>
            <option value="medium" ${
              settings.visualOptions.nodeSize === "medium" ? "selected" : ""
            }>Medium</option>
            <option value="large" ${
              settings.visualOptions.nodeSize === "large" ? "selected" : ""
            }>Large</option>
          </select>
        </div>
      </div>
      
      <div class="button-container">
        <button id="apply-settings" class="apply-button">Apply Settings</button>
        <button id="clear-settings" class="clear-button">Clear Settings</button>
      </div>
    `;
  }

  // Attach event listeners to form controls
  function attachEventListeners() {
    // Start date input
    const startDateInput = document.getElementById("start-date");
    if (startDateInput) {
      startDateInput.addEventListener("change", function() {
        const startDate = this.value;
        settings.dateRange.startDate = startDate;
        
        // Update the end date min attribute
        const endDateInput = document.getElementById("end-date");
        if (endDateInput && startDate > endDateInput.value) {
          endDateInput.value = startDate;
          settings.dateRange.endDate = startDate;
        }
      });
    }

    // End date input
    const endDateInput = document.getElementById("end-date");
    if (endDateInput) {
      endDateInput.addEventListener("change", function() {
        const endDate = this.value;
        settings.dateRange.endDate = endDate;
        
        // Update the start date max attribute
        const startDateInput = document.getElementById("start-date");
        if (startDateInput && endDate < startDateInput.value) {
          startDateInput.value = endDate;
          settings.dateRange.startDate = endDate;
        }
      });
    }

    // Name search input
    const nameSearchInput = document.getElementById("name-search-input");
    if (nameSearchInput) {
      nameSearchInput.addEventListener("input", function() {
        settings.nameSearchInput = this.value;
      });
    }

    // Name search input
    const subjectSearchInput = document.getElementById("subject-search-input");
    if (subjectSearchInput) {
      subjectSearchInput.addEventListener("input", function() {
        settings.subjectSearchInput = this.value;
      });
    }

    // Limit input
    const limitInput = document.getElementById("limit-input");
    if (limitInput) {
      limitInput.addEventListener("change", function() {
        const value = parseInt(this.value) || 1;
        settings.limit = Math.max(1, Math.min(100000, value));
        this.value = settings.limit; // Update input if value was clamped
      });
    }

    // Show labels checkbox
    const showLabelsCheckbox = document.getElementById("show-labels");
    if (showLabelsCheckbox) {
      showLabelsCheckbox.addEventListener("change", function() {
        settings.visualOptions.showLabels = this.checked;
      });
    }

    // Show relationships checkbox
    const showRelationshipsCheckbox = document.getElementById("show-relationships");
    if (showRelationshipsCheckbox) {
      showRelationshipsCheckbox.addEventListener("change", function() {
        settings.visualOptions.showRelationships = this.checked;
      });
    }

    // Node size dropdown
    const nodeSizeSelect = document.getElementById("node-size");
    if (nodeSizeSelect) {
      nodeSizeSelect.addEventListener("change", function() {
        settings.visualOptions.nodeSize = this.value;
      });
    }

    // Apply button
    const applyButton = document.getElementById("apply-settings");
    if (applyButton) {
      applyButton.addEventListener("click", function() {
        if (onSettingsChangeCallback) {
          onSettingsChangeCallback(settings);
        }
      });
    }

    // Clear button
    const clearButton = document.getElementById("clear-settings");
    if (clearButton) {
      clearButton.addEventListener("click", function() {
        // Reset settings to default values
        settings = JSON.parse(JSON.stringify(default_settings));
        
        // Update the UI to reflect the default settings
        updateUI();
        
        // Call the callback with the default settings
        if (onSettingsChangeCallback) {
          onSettingsChangeCallback(settings);
        }
      });
    }
  }

  // Update UI elements to match current settings
  function updateUI() {
    // Update date inputs
    const startDateInput = document.getElementById("start-date");
    if (startDateInput) {
      startDateInput.value = settings.dateRange.startDate;
    }
    
    const endDateInput = document.getElementById("end-date");
    if (endDateInput) {
      endDateInput.value = settings.dateRange.endDate;
    }
    
    // Update text search inputs
    const nameSearchInput = document.getElementById("name-search-input");
    if (nameSearchInput) {
      nameSearchInput.value = settings.nameSearchInput;
    }
    
    const subjectSearchInput = document.getElementById("subject-search-input");
    if (subjectSearchInput) {
      subjectSearchInput.value = settings.subjectSearchInput;
    }
    
    // Update limit input
    const limitInput = document.getElementById("limit-input");
    if (limitInput) {
      limitInput.value = settings.limit;
    }
    
    // Update checkboxes
    const showLabelsCheckbox = document.getElementById("show-labels");
    if (showLabelsCheckbox) {
      showLabelsCheckbox.checked = settings.visualOptions.showLabels;
    }
    
    const showRelationshipsCheckbox = document.getElementById("show-relationships");
    if (showRelationshipsCheckbox) {
      showRelationshipsCheckbox.checked = settings.visualOptions.showRelationships;
    }
    
    // Update node size select
    const nodeSizeSelect = document.getElementById("node-size");
    if (nodeSizeSelect) {
      nodeSizeSelect.value = settings.visualOptions.nodeSize;
    }
  }

  // Update settings externally
  function updateSettings(newSettings) {
    console.log("Update Settings Called with:", newSettings);
    settings = { 
      ...settings, 
      ...newSettings,
      dateRange: {
        ...settings.dateRange,
        ...(newSettings.dateRange || {})
      },
      visualOptions: {
        ...settings.visualOptions,
        ...(newSettings.visualOptions || {})
      }
    };
    
    // Handle nameSearchInput explicitly as a string, not an object
    if (newSettings.nameSearchInput !== undefined) {
      settings.nameSearchInput = newSettings.nameSearchInput;
    }
    
    if (newSettings.subjectSearchInput !== undefined) {
      settings.subjectSearchInput = newSettings.subjectSearchInput;
    }

    // Update UI to reflect new settings
    updateUI();
  }

  // Get current settings
  function getSettings() {
    return JSON.parse(JSON.stringify(settings)); // Return a deep copy
  }

  // Return public API
  return {
    init,
    updateSettings,
    getSettings,
  };
})();
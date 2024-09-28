import logo from './peopleplusai.png'; // Importing the logo image
import { useState } from "react"; // Importing useState hook from React
import './App.css'; // Importing custom styles for App
import './Tabs.css'; // Importing custom styles for Tabs
import Footer from './Footer.js'; // Importing Footer component
import Content from './ContentTab'; // Importing ContentTab component

function App() {
  // Language options for translation dropdown
  const languageOptions = [
    { value: 'english', text: 'English' },
    { value: 'hindi', text: 'Hindi' },
    { value: 'marathi', text: 'Marathi' }
  ];

  // State variables to manage input, messages, and API response data
  const [claim, setClaim] = useState(""); // User input for product claim
  const [ingredients, setIngredients] = useState(""); // User input for ingredients
  const [message, setMessage] = useState(""); // Status message during claim analysis
  const [translationMessage, setTranslationMessage] = useState(""); // Status message during translation
  const [verdictData, setVerdictData] = useState({
    verdict: "Please provide input",
    why: ["Please provide input"],
    detailed_analysis: "Please provide input"
  }); // Verdict data for analysis results
  const [verdictEnglishData, setVerdictEnglishData] = useState(verdictData); // English version of verdict data for translation fallback
  const [activeContentIndex, setActiveContentIndex] = useState("verdict"); // Tab navigation state
  const [langSelected, setLangSelected] = useState("english"); // Currently selected language for translation
  const [isDisabled, setIsDisabled] = useState(true); // Disable translation dropdown until a valid response is received

  const API_ENDPOINT = "https://consumewise.peopleplus.ai:8081"; // Backend API endpoint

  // Helper function to fetch data from API with error handling
  const fetchData = async (url, setError) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // If response is successful, parse the JSON response
      if (response.ok) {
        const responseData = await response.text();
        return JSON.parse(JSON.parse(responseData));  // Assuming double-parsing is required
      } else {
        setError("Some error occurred"); // Set error message if status is not OK
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError("Some error occurred"); // Catch and log errors from API call
    }
  };

  // Handle claim form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form default submission
    setLangSelected("english"); // Set language to English on form submission
    setMessage("Request Submitted. Analyzing..."); // Display message while waiting for API response

    const apiUrl = `${API_ENDPOINT}/claims/analyze?claim=${claim}&ingredients=${ingredients}`; // Construct API URL
    const data = await fetchData(apiUrl, setMessage); // Fetch claim analysis data from API

    if (data) {
      // Update state with fetched analysis data
      setVerdictData(data);
      setVerdictEnglishData(data); // Set English data for fallback in translation
      setMessage("Response Received"); // Notify user that response is received
      setIsDisabled(false); // Enable translation dropdown after successful response
    }
  };

  // Handle language change for translation
  const handleLangChange = async (event) => {
    const selectedLang = event.target.value; // Get selected language from dropdown
    setLangSelected(selectedLang); // Set selected language in state

    // If English is selected, show English data without translation
    if (selectedLang === "english") {
      setVerdictData(verdictEnglishData);
      return;
    }

    setTranslationMessage("Translation Request Submitted. Translating..."); // Notify user translation is in progress
    const translationUrl = `${API_ENDPOINT}/translate/indic?input_val=${JSON.stringify(verdictData)}&language=${selectedLang}`; // Construct API URL for translation
    const translatedData = await fetchData(translationUrl, setTranslationMessage); // Fetch translation data from API

    if (translatedData) {
      setVerdictData(translatedData); // Update state with translated data
      setTranslationMessage("Translated Successfully."); // Notify user that translation is done
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* Logo */}
        <img src={logo} className="people-logo" alt="logo" />

        {/* Claim Form */}
        <form id="claimsForm" onSubmit={handleSubmit}>
          <input
            className="input_box"
            type="text"
            id="claim_input"
            placeholder="Enter Product Claim [Healthy, Nutritional etc]"
            value={claim}
            onChange={(e) => setClaim(e.target.value)} // Update claim state on input change
          />
          <br />
          <input
            className="input_box"
            type="text"
            id="ingredient_input"
            placeholder="Enter Ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)} // Update ingredients state on input change
          />
          <br />
          <button type="submit">Submit</button> {/* Submit button to trigger form submission */}
        </form>
        
        {/* Display status messages */}
        {message && <div className="message"><p>{message}</p></div>}

        {/* Tab Navigation */}
        <div id="tabs">
          <menu>
            {/* Tab buttons */}
            {["verdict", "why", "detailed_analysis"].map((tab) => (
              <button
                key={tab}
                className={activeContentIndex === tab ? "active" : ""}
                onClick={() => setActiveContentIndex(tab)} // Switch tabs on click
              >
                {tab === "verdict" ? "Verdict" : tab === "why" ? "Why?" : "Detailed Information"}
              </button>
            ))}
          </menu>

          {/* Tab Content */}
          <div id="tab-content">
            <Content index={activeContentIndex} jsonData={verdictData} /> {/* Display the content of the active tab */}
          </div>

          {/* Language Selector */}
          <div>
            <select value={langSelected} onChange={handleLangChange} disabled={isDisabled}> {/* Disable dropdown if no data */}
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.text}
                </option>
              ))}
            </select>

            {/* Translation status messages */}
            {translationMessage && <div className="translationMessage"><p>{translationMessage}</p></div>}
          </div>
        </div>

        {/* Footer component */}
        <Footer />
      </header>
    </div>
  );
}

export default App;

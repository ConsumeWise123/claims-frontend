import logo from './peopleplusai.png';
import { useState } from "react";
import './App.css';
import './Tabs.css';
import Content from './ContentTab';

function App() {
  const [claim, setClaim] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [message, setMessage] = useState("")
  const [verdictData, setVerdictData] = useState({"verdict":"Please provide input",
  "why":["Please provide input"],
  "detailed_analysis":"Please provide input"})
  const [activeContentIndex, setActiveContentIndex] = useState("verdict");
  
  let handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending Request to Backend Claims/Analyze");
      console.log(claim)
      console.log(ingredients)

      const apiUrl = `http://172.31.10.130:8081/claims/analyze?claim=${claim}&ingredients=${ingredients}`;
      setMessage("Request Submitted. Analyzing...");
      
      const response = await fetch(apiUrl)
      setMessage("Response Received");
      if (response.status === 200) {
        console.log("Successfully Recieved Response")
        setClaim("");
        setIngredients("");
        let respData = await response.text()
        let jsondata = JSON.parse(JSON.parse(respData)) //TODO: Fi x double parsing needed
  
        // setVerdict(data.verdict)
        console.log("Setting Message")
        console.log(jsondata)
        setVerdictData(jsondata);
        }
        else {
          setMessage("Some error occured");
        }

    } catch (err) {
      setMessage("Some error occured");
      console.log(err);
    }
  };

  return (
    <div className="App">
      
      <header className="App-header">
        <img src={logo} className="people-logo" alt="logo" />
        
        <form id="claimsForm" onSubmit={handleSubmit}>
          <input className="input_box" type="text" id="claim_input" 
          placeholder="Enter Product Claim [Healthy, Nutritional etc]"
          onChange={(e) => setClaim(e.target.value)}
          >
          </input>
          <br></br>
          <input className="input_box" type="text" id="ingredient_input" 
          placeholder="Enter Ingredients"
          onChange={(e) => setIngredients(e.target.value)}
          >
          </input>
          <br></br>
          <button type="submit">Submit</button>
        </form>
        <div className="message">{message ? <p>{message}</p> : null}</div>
     

      <div id="tabs">
        <menu>
          <button
            className={activeContentIndex === "verdict" ? "active" : ""}
            onClick={() => setActiveContentIndex("verdict")}
          >
            Verdict
          </button>
          <button
            className={activeContentIndex === "why" ? "active" : ""}
            onClick={() => setActiveContentIndex("why")}
          >
            Why?
          </button>
          <button
            className={activeContentIndex === "detailed_analysis" ? "active" : ""}
            onClick={() => setActiveContentIndex("detailed_analysis")}
          >
            Detailed Information
          </button>
        </menu>
        <div id="tab-content">
          <ul>
          <Content
          index={activeContentIndex}
          jsonData={verdictData}
          />
          </ul>
        </div>
      </div>
      </header>
    </div>
  );
}

export default App;

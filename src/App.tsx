import './App.css';
import FileUpload from './components/FileUpload';
import Chat from './components/Chat';

function App() {
  // You might want to get this from your app's state or context
  const arbitrationCaseId = "test-case-123"; // Replace with actual case ID

  return (
    <div className="App">
      <h1>Arbitration Case Assistant</h1>
      <div>
        <h2>Upload Case Documents</h2>
        <FileUpload arbitrationCaseId={arbitrationCaseId} />
      </div>
      <div>
        <h2>Chat</h2>
        <Chat />
      </div>
    </div>
  );
}

export default App;

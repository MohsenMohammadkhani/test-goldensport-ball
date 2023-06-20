import AddBall from "./AddBall";
import Ground from "./Ground";
import { v4 as uuidv4 } from 'uuid';

function App() {
  sessionStorage.setItem("tab-id", uuidv4());

  return (
    <>
      <AddBall />
      <Ground />
    </>
  );
}

export default App;

import ReactGA from "react-ga";
import React from "react";
import PropTypes from "prop-types";
import Explorer from "./Explorer";
import "../../css/react-context-menu.css";
import "../../css/winamp.css";

import Desktop from "./Desktop";
import WinampApp from "./WinampApp";
import InfosBar from "./InfosBar";
import SelectionBox from "./SelectionBox";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectionBox: { target: [0, 0], origin: [0, 0] }
    };
  }

  componentDidMount() {
    ReactGA.pageview("/app");
  }

  render() {
    return (
      <div>
        <SelectionBox
          selectZoneId={"selectzone"}
          onSelect={(e, origin, target) =>
            this.setState({ selectionBox: { target, origin } })
          }
        >
          <InfosBar />
          <WinampApp />
          <Desktop selectionBox={this.state.selectionBox} />
          <Explorer />
        </SelectionBox>
      </div>
    );
  }
}

App.propTypes = {
  container: PropTypes.instanceOf(Element)
};

export default App;

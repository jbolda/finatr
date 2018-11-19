import React from 'react';
import PropTypes from 'prop-types';

class TabView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeTab: null };
    if (props.tabTitles.length > 0) {
      this.state.activeTab = 0;
    }
  }

  tabClick(index, event) {
    console.log('clicked');
    if (event) event.preventDefault();
    if (this.props.tabClick) {
      this.props.tabClick(index);
    } else {
      this.setState({ activeTab: index });
    }
  }

  computeUrl(tabName) {
    // href={`#/${this.computeUrl(tab)}`}
    let url = tabName.toLowerCase();
    url = url.replace(' ', '_');
    return url;
  }

  render() {
    let tabContents = null;
    let activeTab = this.props.activeTab
      ? this.props.activeTab
      : this.state.activeTab;

    if (
      activeTab !== null &&
      this.props.tabContents &&
      this.props.tabContents[activeTab]
    ) {
      tabContents = this.props.tabContents[activeTab];
    }

    return (
      <React.Fragment>
        <div className="tabs">
          <ul>
            {this.props.tabTitles.map((tab, index) => (
              <li key={tab} className={index === activeTab ? 'is-active' : ''}>
                <a
                  href={`#/${this.computeUrl(tab)}`}
                  onClick={this.tabClick.bind(this, index)}
                >
                  {tab}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="container is-fluid">{tabContents}</div>
      </React.Fragment>
    );
  }
}

TabView.defaultProps = {
  tabTitles: [],
  tabContents: null
};

TabView.propTypes = {
  tabTitles: PropTypes.array,
  tabContents: PropTypes.node
};

export default TabView;

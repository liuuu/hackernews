import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

class CreateLink extends Component {
  state = {
    description: '',
    url: '',
  };

  _createLink = async () => {
    const postedById = localStorage.getItem('GC_USER_ID');
    if (!postedById) {
      console.error('No user logged in');
      return;
    }
    const { description, url } = this.state;
    // have not implemented update function or optimisticResponse
    await this.props.createLinkMutation({
      variables: {
        description,
        url,
        postedById,
      },
    });

    this.props.history.push('/new/1');
  };

  render() {
    return (
      <div>
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={this.state.description}
            onChange={e => this.setState({ description: e.target.value })}
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={this.state.url}
            onChange={e => this.setState({ url: e.target.value })}
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        <button onClick={() => this._createLink()}>Submit</button>
      </div>
    );
  }
}

const CREATE_LINK_MUTATION = gql`
  mutation CreateLinkMutation($description: String!, $url: String!, $postedById: ID!) {
    createLink(description: $description, url: $url, postedById: $postedById) {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
    }
  }
`;

export default graphql(CREATE_LINK_MUTATION, { name: 'createLinkMutation' })(CreateLink);

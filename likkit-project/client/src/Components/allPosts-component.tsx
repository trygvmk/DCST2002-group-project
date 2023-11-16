import * as React from 'react';
import { Component } from 'react-simplified';
import { Card, Row, Column, Form, Button, NavBar, upLikk, downLikk } from '../widgets';
import taskService, { Question } from '../question-service';
import { createHashHistory } from 'history';
import SearchContainer from './searchContainer-component';

const history = createHashHistory();

function shrek() {
  alert('SHREK');
}

export class Menu extends Component {
  search: string = '';
  render() {
    return (
      <NavBar
        brand={
          <img
            src="https://cdn.discordapp.com/attachments/623523695540830219/1169948601183649832/380254333_641845358065071_8017670276526516197_n.png?ex=6557428b&is=6544cd8b&hm=45e12c97e4c20ea17fc19d8feb50b18def1fa2ad524236098cb95bba40b4a144&"
            alt="Picture of likkit logo"
          />
        }
        id="test"
      >
        <Column width={3}>
          <NavBar.Link to="/">
            <h1>likkit</h1>
          </NavBar.Link>
        </Column>
        <Column width={6} none>
          <SearchContainer />
        </Column>
        <Column width={2} right>
          <NavBar.Link to="/user">
            <img
              src="https://www.iconpacks.net/icons/2/free-user-icon-3297-thumb.png"
              alt="Green profile picture"
            />
          </NavBar.Link>
        </Column>
        <Column width={1} none>
          <Row>Navn</Row>
          <Row>likks: 371</Row>
        </Column>
      </NavBar>
    );
  }
}

export class AllPosts extends Component {
  search: string = '';
  posts: Question[] = [];
  selectedOption: string = 'popular'; 

  handleSortChange = (event: any) => {
    const selectedOption = event.target.value;
    this.selectedOption = selectedOption;
    
    if (selectedOption === 'popular') {
      taskService.questionGetAll().then((posts) => (this.posts = posts));
    } else if (selectedOption === 'newest') {
      taskService.questionGetAllNew().then((posts) => (this.posts = posts));
    }
    this.forceUpdate(); // Trigger a re-render
  };

  handleUpvote = (questionId: number) => {
    taskService
      .upvoteQuestion(questionId)
      .then(() => {
        this.handleSortChange({ target: { value: this.selectedOption } });
      })
      .catch((error) => {
        console.error('Error upvoting question:', error);
      });
  };

  handleDownvote = (questionId: number) => {
    taskService
      .downvoteQuestion(questionId)
      .then(() => {
        this.handleSortChange({ target: { value: this.selectedOption } });
      })
      .catch((error) => {
        console.error('Error downvoting question:', error);
      });
  };

  render() {
    return (
      <div
        style={{
          backgroundImage: 'linear-gradient(180deg, rgb(110, 160, 175), rgb(15, 40, 60))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            margin: '2%',
          }}
        >
          <Card title="" width="100%" backgroundColor="rgb(90,90,90)">
            <Row marginBottom={5}>
              <div
                style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginLeft: '5px' }}
              >
                <Column>Sort by:</Column>
                <Column>
                  <div style={{ marginLeft: '10px' }}>
                    <select
                      id="dropdown"
                      style={{
                        appearance: 'none',
                        background: '#5A5A5A',
                        color: '#ffffff',
                        cursor: 'pointer',
                        border: '1px solid #ffffff',
                        borderRadius: '10px',
                        padding: '5px',
                      }}
                      onChange={this.handleSortChange}
                      value={this.selectedOption}
                    >
                      <option value="popular">Popular</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </Column>
                <Column right>
                  <div
                    style={{
                      appearance: 'none',
                      background: '#5A5A5A',
                      color: '#ffffff',
                      cursor: 'pointer',
                      border: '1px solid #ffffff',
                      borderRadius: '10px',
                      padding: '5px',
                    }}
                  >
                    <select
                      id="filterdropdown"
                      style={{
                        appearance: 'none',
                        border: '#5A5A5A',
                        background: '#5A5A5A',
                        color: '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="none">None</option>
                    </select>
                  </div>
                </Column>
                <Column right>
                  <div style={{ marginRight: '5px' }}>Filters:</div>
                </Column>
              </div>
            </Row>

            <Card title="" width="100%" backgroundColor="rgb(70,70,70)" marginBottom={-3}>
              <Row>
                {this.posts.map((post, i) => (
                  <Card
                    title=""
                    width="100%"
                    backgroundColor="rgb(60,60,60)"
                    marginBottom={4}
                    key={i}
                  >
                    <div
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '25px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Button.Vote onClick={() => this.handleUpvote(post.question_id)}>
                        {upLikk}
                      </Button.Vote>
                      <p style={{ margin: '0 10px' }}>{post.upvotes - post.downvotes}</p>
                      <Button.Vote onClick={() => this.handleDownvote(post.question_id)}>
                        {downLikk}
                      </Button.Vote>
                    </div>

                    <Button.Post onClick={() => history.push('/posts/' + post.question_id)}>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
                        <p>{post.title}</p>
                      </div>
                    </Button.Post>
                  </Card>
                ))}
              </Row>
            </Card>
          </Card>
        </div>
      </div>
    );
  }
  mounted() {
    taskService.questionGetAll().then((posts) => (this.posts = posts));
  }
}

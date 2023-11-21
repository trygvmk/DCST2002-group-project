import React from 'react';
import { UserContext, UserProvider, handleLogout } from '../authState';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Form, Button, NavBar, upLikk, downLikk } from '../widgets';
import taskService, { Question, Favorites } from '../question-service';
import userpageService from '../userpage-service';
import { createHashHistory } from 'history';
import SearchContainer from './searchContainer-component';
import PrettyPreview from './prettyPreview-component';

const history = createHashHistory();

export class Menu extends Component {
  search: string = '';
  user_id: number = Number(sessionStorage.getItem('user_id'));
  likkAmount: number = 0;

  render() {
    return (
      <UserContext.Consumer>
        {(userData) => (
          <NavBar
            brand={
              <img
                src="https://cdn.discordapp.com/attachments/623523695540830219/1169948601183649832/380254333_641845358065071_8017670276526516197_n.png?ex=6557428b&is=6544cd8b&hm=45e12c97e4c20ea17fc19d8feb50b18def1fa2ad524236098cb95bba40b4a144&"
                alt="Picture of likkit logo"
              />
            }
            id="test"
          >
            <Column width={2}>
              <NavBar.Link to="/">
                <div>
                  <h1>likkit</h1>
                </div>
              </NavBar.Link>
            </Column>
            <Column width={6} none>
              <div>
                <SearchContainer />
              </div>
            </Column>
            <Column width={1} right>
              {userData?.user_id ? (
                <div>
                  <NavBar.Link to="/user">
                    <img
                      src={userData.user_pfp}
                      alt="User profile picture"
                      style={{ borderRadius: '50%' }}
                    />
                  </NavBar.Link>
                </div>
              ) : (
                <NavBar.Link to="/login">
                  <Button.Post onClick={() => {}}>Login</Button.Post>
                </NavBar.Link>
              )}
            </Column>
            {userData?.user_id ? (
              <>
                <Column width={2} none>
                  <Row>
                    <div>
                      Logged in as <b>{userData.username}</b>
                    </div>
                  </Row>
                  <Row>
                    <div>
                      likks: <b>{this.likkAmount}</b>
                    </div>
                  </Row>
                </Column>
                <Column width={1} right>
                  <Button.Danger onClick={handleLogout}>Log out</Button.Danger>
                </Column>
              </>
            ) : null}
          </NavBar>
        )}
      </UserContext.Consumer>
    );
  }
  mounted() {
    userpageService
      .getTotalLicks(this.user_id)
      .then((totalLicks) => (this.likkAmount = totalLicks));
  }
}

export class Home extends Component {
  search: string = '';
  user_id: number = Number(sessionStorage.getItem('user_id'));
  posts: Question[] = [];
  userFavorites: Favorites[] = [];
  postsNew: Question[] = [];
  postsPopular: Question[] = [];
  postsUnanswered: Question[] = [];
  selectedOption: string = 'popular'; // default selected option

  state = {
    favoriteState: false,
  };

  handleSortChange = (event: any) => {
    const selectedOption = event.target.value;
    this.selectedOption = selectedOption;

    if (selectedOption === 'popular') {
      taskService.questionGetThree().then((posts) => (this.posts = posts));
    } else if (selectedOption === 'newest') {
      taskService.questionGetThreeNew().then((posts) => (this.posts = posts));
    } else if (selectedOption === 'unanswered') {
      taskService.questionGetUnanswered().then((posts) => (this.posts = posts));
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
      <div className="background">
        <div
          style={{
            margin: '2%',
          }}
        >
          <Card title="" width="100%" backgroundColor="rgb(90,90,90)">
            <Row marginBottom={5}>
              <Column width={2}></Column>
              <Column width={8} none>
                <NavBar.Link to="createPost">
                  <div id="createPost" onClick={() => console.log('alooo')}>
                    <Form.Input
                      type="text"
                      value={this.search}
                      onChange={(event) => (this.search = event.currentTarget.value)}
                      placeholder="Create a post..."
                    />
                  </div>
                </NavBar.Link>
              </Column>
            </Row>
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
                      <option value="unanswered">Unanswered</option>
                    </select>
                  </div>
                </Column>
                <Column right>
                  <Button.Success onClick={() => history.push('/posts')}>
                    View all posts
                  </Button.Success>
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
                    marginBottom={3}
                    key={i}
                  >
                    <Row>
                      <Column width={2}>
                        <div
                          style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '25px',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            alignContent: 'center',
                          }}
                        >
                          <Column width={4}>
                            <Button.Vote onClick={() => this.handleUpvote(post.question_id)}>
                              {upLikk}
                            </Button.Vote>
                          </Column>
                          <Column width={4}>
                            <p style={{ margin: '0 10px' }}>{post.upvotes - post.downvotes}</p>
                          </Column>
                          <Column width={4}>
                            <Button.Vote onClick={() => this.handleDownvote(post.question_id)}>
                              {downLikk}
                            </Button.Vote>
                          </Column>
                        </div>
                      </Column>
                      <Column width={8} none>
                        {/*Koden her gir error siden den ikke liker at vi har en knapp og annet innhold inne i en knapp*/}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            cursor: 'pointer',
                          }}
                          onClick={() => history.push('/posts/' + post.question_id)}
                        >
                          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '25px' }}>
                            <p style={{ alignItems: 'center', alignContent: 'center' }}>
                              {post.title}
                            </p>
                            <div style={{ fontSize: '14px', fontWeight: 'normal' }}>
                              <PrettyPreview htmlContent={post.content} maxLength={100} />
                            </div>
                          </div>
                        </div>
                      </Column>
                      <Column width={2} right>
                        <div>
                          {this.userFavorites.some(
                            (favorite) =>
                              favorite.question_id == post.question_id &&
                              favorite.answer_id == null,
                          ) ? (
                            <img
                              style={{ cursor: 'pointer' }}
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Gold_Star.svg/1024px-Gold_Star.svg.png"
                              alt="Filled picture of gold star, indicates favorites"
                              onClick={() => {
                                taskService
                                  .removeFavorite(this.user_id, post.question_id, null)
                                  .then(() => {
                                    window.location.reload();
                                  });
                              }}
                            />
                          ) : (
                            <img
                              style={{ cursor: 'pointer' }}
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Five-pointed_star.svg/800px-Five-pointed_star.svg.png"
                              alt="Empty picture of star, indicates not favorites"
                              onClick={() => {
                                taskService
                                  .addFavorite(this.user_id, post.question_id, null)
                                  .then(() => {
                                    window.location.reload();
                                  });
                              }}
                            />
                          )}
                        </div>
                      </Column>
                    </Row>
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
    taskService.questionGetThree().then((posts) => (this.posts = posts));
    taskService.questionGetThreeNew().then((postsNew) => (this.postsNew = postsNew));
    taskService.getUserFavorites(this.user_id).then((userFavorites) => {
      this.userFavorites = userFavorites;
    });
    taskService
      .questionGetUnanswered()
      .then((postsUnanswered) => (this.postsUnanswered = this.postsUnanswered));
  }
}

export class Posts extends Component {
  render() {
    return (
      <div>
        <h1>Posts</h1>
      </div>
    );
  }
}

export class TagPosts extends Component {
  render() {
    return (
      <div>
        <h1>Posts</h1>
      </div>
    );
  }
}

export class Post extends Component {
  render() {
    return (
      <div>
        <h1>Post</h1>
      </div>
    );
  }
}

export class CreatePost extends Component {
  title: string = '';
  text: string = '';
  tags: string = '';
  imageLink: string = '';

  render() {
    return (
      <div
        style={{
          backgroundImage: 'linear-gradient(180deg, rgb(110, 160, 175), rgb(15, 40, 60))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
          height: '150vh',
        }}
      >
        <div
          style={{
            margin: '1%',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '20px',
          }}
        >
          <Card title="" width="100%" backgroundColor="rgb(90,90,90)">
            <Row marginBottom={5}>
              <Column width={2}>Title</Column>
              <Column width={8}>
                <Form.Input
                  type="text"
                  value={this.title}
                  onChange={(event) => (this.title = event.currentTarget.value)}
                  placeholder="Title..."
                />
              </Column>
            </Row>
            <Row marginBottom={5}></Row>
          </Card>
        </div>
      </div>
    );
  }
}

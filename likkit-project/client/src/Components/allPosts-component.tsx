import * as React from 'react';
import { Component } from 'react-simplified';
import { Card, Row, Column, Button, upLikk, downLikk, filledStar, emptyStar } from '../widgets';
import taskService, { Question, Favorites } from '../question-service';
import { createHashHistory } from 'history';
import PrettyPreview from './prettyPreview-component';

const history = createHashHistory();

export class AllPosts extends Component {
  search: string = '';
  user_id: number = Number(sessionStorage.getItem('user_id'));
  userFavorites: Favorites[] = [];
  posts: Question[] = [];
  selectedOption: string = 'popular';

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
                      className="dropdownmenu"
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
                  <Button.Light onClick={() => history.push('/tags')}>Sort by tags</Button.Light>
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
                            <Button.Vote
                              onClick={() => {
                                taskService
                                  .removeFavorite(this.user_id, post.question_id, null)
                                  .then(() => {
                                    window.location.reload();
                                  });
                              }}
                            >
                              {filledStar}
                            </Button.Vote>
                          ) : (
                            <Button.Vote
                              onClick={() => {
                                taskService
                                  .addFavorite(this.user_id, post.question_id, null)
                                  .then(() => {
                                    window.location.reload();
                                  });
                              }}
                            >
                              {emptyStar}
                            </Button.Vote>
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
    taskService.questionGetAll().then((posts) => (this.posts = posts));
    taskService.getUserFavorites(this.user_id).then((userFavorites) => {
      this.userFavorites = userFavorites;
    });
  }
}

import * as React from 'react';
import { Component } from 'react-simplified';
import taskService, { Question, Answer, Comment, Tag, Favorites } from '../question-service';
import { createHashHistory } from 'history';
import {
  Card,
  Row,
  Column,
  Form,
  Button,
  upLikk,
  downLikk,
  SoMeX,
  SoMeInsta,
  SoMeReddit,
  SoMeRedditLink,
  SoMeInstaLink,
  SoMeXLink,
  emptyStar,
  filledStar,
  bubble,
  checkmark,
} from '../widgets';
import DOMPurify from 'dompurify';
import PrettyPreview from './prettyPreview-component';

const history = createHashHistory();

export class ViewPost extends Component<{ match: { params: { id: number } } }> {
  question: Question = {
    username: '',
    question_id: 1,
    user_id: 0,
    title: '',
    content: '',
    created_at: '',
    upvotes: 2,
    downvotes: 1,
  };

  writeComment: string = '';

  comments: Comment[] = [];

  userFavorites: Favorites[] = [];

  tags: Tag[] = [];

  selectedOption: string = 'best';

  user_id: number = Number(sessionStorage.getItem('user_id'));

  state = {
    showButtons: false,
    showcommentSection: false,
    activeButtonId: null,
    rendercommentButton: true,
  };

  // Handles state change when selecting from dropdown menu
  handleSortChange = (event: any) => {
    const selectedOption = event.target.value;
    this.selectedOption = selectedOption;

    if (selectedOption === 'popular') {
      taskService
        .commentsGet(this.props.match.params.id)
        .then((getComments) => (this.comments = getComments));
    } else if (selectedOption === 'newest') {
      taskService
        .getNewestComments(this.props.match.params.id)
        .then((newComments) => (this.comments = newComments));
    } else if (selectedOption === 'best') {
      taskService
        .sortBestComments(this.props.match.params.id)
        .then((bestComments) => (this.comments = bestComments));
    }
    this.forceUpdate(); // Trigger a re-render
  };

  handleButtonClick = (id: number) => {
    this.setState({ activeButtonId: id });
  };

  //Renders the reply button correctly
  rendercommentButton = (comment: Comment) => {
    if (
      this.state.rendercommentButton === true ||
      this.state.activeButtonId !== comment.answer_id
    ) {
      return (
        <Column width={10} none>
          <Button.Share
            onClick={() => {
              this.handleButtonClick(comment.answer_id);
              this.setState({ showcommentSection: true, rendercommentButton: false });
            }}
          >
            Reply
          </Button.Share>
        </Column>
      );
    } else {
      return null;
    }
  };

  //Renders the comment section when clicking the reply button
  rendercommentSection = (comment: Comment) => {
    if (this.state.activeButtonId === comment.answer_id) {
      return (
        <>
          <Row marginTop={2}>
            <Column width={6} none>
              <Form.Textarea
                type="text"
                value={this.writeComment}
                onChange={(event) => (this.writeComment = event.currentTarget.value)}
                placeholder="Write your comment here..."
                style={{ height: '15vh' }}
              />
            </Column>
          </Row>
          <Row>
            <Column width={6} right>
              <Button.Blue
                onClick={() => {
                  taskService
                    .createCommentReply(
                      this.props.match.params.id,
                      comment.answer_id,
                      this.writeComment,
                      this.user_id,
                    )
                    .then(() => {
                      this.writeComment = '';
                      taskService
                        .commentsGet(this.props.match.params.id)
                        .then((getComments) => (this.comments = getComments));
                    });
                  this.setState({
                    showcommentSection: false,
                    rendercommentButton: true,
                    activeButtonId: null,
                  });
                }}
              >
                Post
              </Button.Blue>
            </Column>
          </Row>
        </>
      );
    }
  };

  handleShowButtons = () => {
    this.setState({ showButtons: !this.state.showButtons });
  };

  renderSocialButtons() {
    if (this.state.showButtons) {
      return (
        <>
          <Button.Vote onClick={SoMeXLink}>{SoMeX}</Button.Vote>
          <Button.Vote onClick={SoMeInstaLink}>{SoMeInsta}</Button.Vote>
          <Button.Vote onClick={SoMeRedditLink}>{SoMeReddit}</Button.Vote>
        </>
      );
    }
    return null;
  }

  handleUpvote = (questionId: number) => {
    taskService
      .upvoteQuestion(questionId)
      .then(() => {
        taskService
          .questionGet(this.props.match.params.id)
          .then((question) => (this.question = question));
      })
      .catch((error) => {
        console.error('Error upvoting question:', error);
      });
    this.forceUpdate();
  };

  handleDownvote = (questionId: number) => {
    taskService
      .downvoteQuestion(questionId)
      .then(() => {
        taskService
          .questionGet(this.props.match.params.id)
          .then((question) => (this.question = question));
      })
      .catch((error) => {
        console.error('Error downvoting question:', error);
      });
    this.forceUpdate();
  };

  handleBestAnswer = (answer_id: number) => {
    this.comments.forEach((comment) => {
      if (comment.answer_id == answer_id) {
        taskService.bestAnswer(answer_id);
      } else if (comment.best_answer == true) {
        taskService.notBestAnswer(comment.answer_id);
      }
    });
    window.location.reload();
  };

  handleUpvoteComment = (answerId: number) => {
    taskService
      .upvoteAnswer(answerId)
      .then(() => {
        taskService
          .commentsGet(this.props.match.params.id)
          .then((getComments) => (this.comments = getComments));
        this.forceUpdate();
      })
      .catch((error) => {
        console.error('Error upvoting answer:', error);
      });
  };

  handleDownvoteComment = (answerId: number) => {
    taskService
      .downvoteAnswer(answerId)
      .then(() => {
        taskService
          .commentsGet(this.props.match.params.id)
          .then((getComments) => (this.comments = getComments));
        this.forceUpdate();
      })
      .catch((error) => {
        console.error('Error downvoting answer:', error);
      });
  };

  //Renders comments with a parent id (Comments that is a reply to another comment)
  mapComments(comments: Comment[], parentId: number, depth: number = 1) {
    return comments
      .filter((reply) => reply.parent_answer_id === parentId)
      .map((reply) => (
        <div
          key={reply.answer_id}
          style={{
            marginLeft: `${depth * 30}px`,
            borderLeft: '1px dotted #ccc',
            paddingLeft: '10px',
          }}
        >
          <Row marginBottom={4}>
            <Row marginBottom={1}>
              <Column>
                <img src={reply.user_pfp} alt={`${reply.username} profile picture`} />
              </Column>
              <div
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '25px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'stretch',
                }}
              ></div>

              <Column width={4}>
                Posted by {reply.username} at {reply.created_at}
              </Column>
            </Row>
            <Row marginBottom={2}>
              <div
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '25px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'stretch',
                }}
              >
                <Button.Vote onClick={() => this.handleUpvoteComment(reply.answer_id)}>
                  {upLikk}
                </Button.Vote>
                <p style={{ margin: '0 10px' }}>{reply.upvotes - reply.downvotes}</p>
                <Button.Vote onClick={() => this.handleDownvoteComment(reply.answer_id)}>
                  {downLikk}
                </Button.Vote>

                <Button.Share onClick={this.handleShowButtons}>Share</Button.Share>

                {this.renderSocialButtons()}

                <div>
                  {this.userFavorites.some(
                    (favorite) =>
                      favorite.question_id == this.props.match.params.id &&
                      favorite.answer_id == reply.answer_id,
                  ) ? (
                    <Button.Vote
                      onClick={() => {
                        taskService
                          .removeFavorite(this.user_id, this.props.match.params.id, reply.answer_id)
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
                          .addFavorite(this.user_id, this.props.match.params.id, reply.answer_id)
                          .then(() => {
                            window.location.reload();
                          });
                      }}
                    >
                      {emptyStar}
                    </Button.Vote>
                  )}
                </div>
                {this.user_id === reply.user_id && (
                  <div style={{ margin: '0 20px', paddingTop: '6px' }}>
                    <Button.Blue onClick={() => history.push('/editComment/' + reply.answer_id)}>
                      edit
                    </Button.Blue>
                  </div>
                )}
              </div>
              <div
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '25px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'stretch',
                }}
              >
                <Card title="" width="100%" backgroundColor="rgb(60,60,60)">
                  <div
                    style={{
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: 'normal',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'stretch',
                      width: '100%',
                    }}
                  >
                    <PrettyPreview htmlContent={reply.content} />
                  </div>
                </Card>
              </div>
            </Row>

            <Row>{this.rendercommentButton(reply)}</Row>

            <Row>{this.rendercommentSection(reply)}</Row>
          </Row>
          {this.mapComments(comments, reply.answer_id, depth + 1)}
        </div>
      ));
  }

  render() {
    const isAuthor = this.user_id === this.question.user_id;
    let activeTags: string = 'Tags:';
    this.tags.forEach((tag) => {
      activeTags += ' ' + tag.tag_name + ',';
    });
    activeTags = activeTags.slice(0, -1) + '.';
    return (
      <div className="background">
        <div
          style={{
            margin: '2%',
          }}
        >
          <Card title="" width="100%" backgroundColor="rgb(90,90,90)">
            {/*Renders the question title and content*/}
            <Card title="" width="100%" backgroundColor="rgb(80,80,80)">
              <div
                style={{
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                {isAuthor && (
                  <Button.Blue
                    onClick={() => history.push('/editPost/' + this.question.question_id)}
                  >
                    edit
                  </Button.Blue>
                )}
                <Row marginBottom={3}>
                  <Column width={1}></Column>
                  <Column>{this.question.title}</Column>
                  <Column width={1} right>
                    <div>
                      {this.userFavorites.some(
                        (favorite) =>
                          favorite.question_id == this.props.match.params.id &&
                          favorite.answer_id == null,
                      ) ? (
                        <Button.Vote
                          onClick={() => {
                            taskService
                              .removeFavorite(this.user_id, this.props.match.params.id, null)
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
                              .addFavorite(this.user_id, this.props.match.params.id, null)
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
              </div>
              <div
                style={{
                  color: 'white',
                  fontSize: '14px',
                }}
              >
                <Row marginBottom={5}>
                  <Column width={1}>
                    <Button.Vote onClick={() => this.handleUpvote(this.question.question_id)}>
                      {upLikk}
                    </Button.Vote>
                    <p
                      style={{
                        marginLeft: '30px',
                        marginTop: '10px',
                        fontWeight: 'bold',
                        fontSize: '25px',
                      }}
                    >
                      {this.question.upvotes - this.question.downvotes}
                    </p>

                    <Button.Vote onClick={() => this.handleDownvote(this.question.question_id)}>
                      {downLikk}
                    </Button.Vote>
                  </Column>
                  <Column>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(this.question.content),
                      }}
                    />
                  </Column>
                  <Column width={1} right></Column>
                </Row>
                <Row>
                  <Column width={1}></Column>
                  <Column>{activeTags}</Column>

                  <Button.Share onClick={this.handleShowButtons}>Share</Button.Share>
                  {this.renderSocialButtons()}
                </Row>
                <Row>
                  Posted by: {this.question.username} at {this.question.created_at}
                </Row>
              </div>
            </Card>
            {/*Renders reply textarea, and the comments*/}
            <Card title="" width="100%" backgroundColor="rgb(80,80,80)">
              <div
                style={{
                  color: 'white',
                  fontSize: '17px',
                }}
              >
                <Row marginBottom={3}>
                  <Column width={1}></Column>
                  <Column width={1}>{bubble}</Column>
                  <Column width={2}>Comments: {this.comments.length}</Column>
                </Row>

                <Row marginBottom={3}>
                  <Column width={1}></Column>
                  <Column none>
                    <Form.Textarea
                      type="text"
                      value={this.writeComment}
                      onChange={(event) => (this.writeComment = event.currentTarget.value)}
                      placeholder="Write your post here..."
                      style={{ height: '30vh' }}
                    />
                  </Column>
                </Row>
                <Row marginBottom={5}>
                  <Column right>
                    <Button.Blue
                      onClick={() => {
                        if (this.writeComment.length <= 100000) {
                          taskService
                            .createComment(
                              this.props.match.params.id,
                              this.writeComment,
                              this.user_id,
                            )
                            .then(() => {
                              this.writeComment = '';
                              taskService
                                .commentsGet(this.props.match.params.id)
                                .then((getComments) => (this.comments = getComments));
                            });
                        } else {
                          alert('The comment cant be more than 100000 characters!');
                        }
                      }}
                    >
                      Post
                    </Button.Blue>
                  </Column>
                </Row>
                <Column>Sort by:</Column>
              </div>
              <Column>
                <div style={{ marginLeft: '10px', color: 'white' }}>
                  <select
                    id="dropdown"
                    className="dropdownmenu"
                    onChange={this.handleSortChange}
                    value={this.selectedOption}
                  >
                    <option value="best">Best</option>
                    <option value="popular">Popular</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </Column>
              {/*Renders all the comments*/}
              <Card title="" width="100%" backgroundColor="rgb(70,70,70)">
                {this.comments.map((comment, i) => {
                  if (comment.parent_answer_id === null) {
                    return (
                      <div
                        style={{
                          color: 'white',
                          fontSize: '14px',
                          borderLeft: '1px dotted #ccc',
                          paddingLeft: '10px',
                        }}
                        key={i}
                      >
                        <Row marginBottom={4}>
                          <Row marginBottom={1}>
                            <Column>
                              <img
                                src={comment.user_pfp}
                                alt={`${comment.username} profile picture`}
                              />
                            </Column>
                            <div
                              style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '25px',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'stretch',
                              }}
                            ></div>

                            <Column width={4}>
                              Posted by {comment.username} at {comment.created_at}
                            </Column>
                          </Row>
                          <Row marginBottom={2}>
                            <div
                              style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '25px',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'stretch',
                              }}
                            >
                              <p style={{ margin: '0 10px' }}>
                                <Button.Vote
                                  onClick={() => this.handleUpvoteComment(comment.answer_id)}
                                >
                                  {upLikk}
                                </Button.Vote>
                              </p>

                              <p style={{ margin: '0 10px' }}>
                                {comment.upvotes - comment.downvotes}
                              </p>
                              <p style={{ margin: '0 10px' }}>
                                <Button.Vote
                                  onClick={() => this.handleDownvoteComment(comment.answer_id)}
                                >
                                  {downLikk}
                                </Button.Vote>
                              </p>
                              <p style={{ margin: '0 10px' }}></p>
                              <Button.Share onClick={this.handleShowButtons}>Share</Button.Share>
                              <p style={{ margin: '0 10px' }}></p>
                              {this.renderSocialButtons()}
                              <div>
                                {this.userFavorites.some(
                                  (favorite) =>
                                    favorite.question_id == this.props.match.params.id &&
                                    favorite.answer_id == comment.answer_id,
                                ) ? (
                                  <Button.Vote
                                    onClick={() => {
                                      taskService
                                        .removeFavorite(
                                          this.user_id,
                                          this.props.match.params.id,
                                          comment.answer_id,
                                        )
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
                                        .addFavorite(
                                          this.user_id,
                                          this.props.match.params.id,
                                          comment.answer_id,
                                        )
                                        .then(() => {
                                          window.location.reload();
                                        });
                                    }}
                                  >
                                    {emptyStar}
                                  </Button.Vote>
                                )}
                              </div>
                              {this.user_id === this.question.user_id && (
                                <div
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => this.handleBestAnswer(comment.answer_id)}
                                >
                                  {checkmark}
                                </div>
                              )}
                              <p style={{ margin: '0 10px' }}></p>
                              {this.user_id === comment.user_id && (
                                <div>
                                  <Button.Blue
                                    onClick={() =>
                                      history.push('/editComment/' + comment.answer_id)
                                    }
                                  >
                                    edit
                                  </Button.Blue>
                                </div>
                              )}
                            </div>

                            <div
                              style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '25px',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'stretch',
                              }}
                            >
                              <Card title="" width="100%" backgroundColor="rgb(60,60,60)">
                                <div
                                  style={{
                                    color: 'white',
                                    fontSize: '20px',
                                    fontWeight: 'normal',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'stretch',
                                    width: '100%',
                                    backgroundColor: comment.best_answer
                                      ? 'rgb(60, 130, 60)'
                                      : 'rgb(60,60,60)',
                                  }}
                                >
                                  <PrettyPreview htmlContent={comment.content} />
                                </div>
                              </Card>
                            </div>
                          </Row>
                          <Row>{this.rendercommentButton(comment)}</Row>
                          <Row>{this.rendercommentSection(comment)}</Row>
                        </Row>
                        {this.mapComments(this.comments, comment.answer_id)}
                      </div>
                    );
                  }
                })}
              </Card>
            </Card>
          </Card>
        </div>
      </div>
    );
  }
  mounted() {
    taskService
      .questionGet(this.props.match.params.id)
      .then((question) => (this.question = question));

    taskService
      .sortBestComments(this.props.match.params.id)
      .then((bestComments) => (this.comments = bestComments));

    taskService.questionTagGet(this.props.match.params.id).then((tags) => (this.tags = tags));

    taskService.getUserFavorites(this.user_id).then((userFavorites) => {
      this.userFavorites = userFavorites;
    });
  }
}

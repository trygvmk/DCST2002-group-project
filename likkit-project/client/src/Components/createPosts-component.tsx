import * as React from 'react';
import { Component } from 'react-simplified';
import taskService, { Question } from '../question-service';
import { Alert, Card, Row, Column, Form, Button, NavBar } from '../widgets';
import { createHashHistory } from 'history';

const history = createHashHistory();

export class CreatePost extends Component {
  title: string = '';
  content: string = '';
  tags: string = '';
 
  questionNew: Question = {
    question_id: 0,
    user_id: 0,
    title: "",
    content: "",
    created_at: "",
    upvotes: 0,
    downvotes: 0,
    karma: 0
  };
  
  questionSolved: boolean = false;

  render() {
    return (
      <div
        style={{
          backgroundImage: 'linear-gradient(180deg, rgb(110, 160, 175), rgb(15, 40, 60))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '150vh',
        }}
      >
        <div
          style={{
            margin: '1%',
            marginLeft: '15%',
            marginRight: '15%',
          }}
        >
          <Card title="" width="100%" backgroundColor="rgb(90,90,90)">
            <Row marginBottom={3}>
              <Column width={2}>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>Title </div>
              </Column>
              <Column width={7} none>
                <Form.Input
                  type="text"
                  value={this.title}
                  onChange={(event) => (this.title = event.currentTarget.value)}
                  placeholder="Title..."
                />
              </Column>
            </Row>
            <Row marginBottom={3}>
              <Column width={1}>
                <div style={{ color: 'white', fontSize: '14px' }}>Solved?</div>
              </Column>
              <Column width={2}>
                <Form.Checkbox
                  checked={this.questionSolved}
                  onChange={(event) =>
                    (this.questionSolved = event.currentTarget.checked ? true : false)
                  }
                />
              </Column>
            </Row>
            <Row marginBottom={5}>
              <Column width={2}></Column>
              <Column width={9} none>
                <Form.Textarea
                  type="text"
                  value={this.content}
                  onChange={(event) => (this.content = event.currentTarget.value)}
                  placeholder="Write your post here..."
                  style={{ height: '55vh' }}
                />
              </Column>
            </Row>
            <Row marginBottom={2}>
              <Column right>
                <Button.Success
                  onClick={() => {
                    taskService.questionCreate(this.title, this.content).then(() => {
                      // Reloads the tasks in the Tasks component
                      // CreatePost.instance()?.mounted(); // .? meaning: call TaskList.instance().mounted() if TaskList.instance() does not return null
                      this.title = '';
                      this.content = '';
                    });
                    taskService.questionGetNewest().then(() => {
                    
                    })
                    history.push('/posts/' + (this.questionNew.question_id + 1));
                  }}
                >
                  Post
                </Button.Success>
                <Button.Success
                  onClick={() => {
                    console.log(this.questionNew.question_id + 1)
                    
                  }}
                >
                  testing
                </Button.Success>
              </Column>
            </Row>
          </Card>
        </div>
      </div>
    );
  }
  mounted() {
    taskService.questionGetNewest().then((questionNew) => (this.questionNew = questionNew));
  }
}

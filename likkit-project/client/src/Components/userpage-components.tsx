import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Form, Button, NavBar } from '../widgets';

export class UserProfile extends Component {
  user: string = 'banan';
  userType: string = 'adminierinios';
  likkAmount: number = 696969;
  upvoteAmount: number = 1337;
  commentAmount: number = 2;
  bestCommentAmount: number = 0;

  render() {
    return (
      <div
        style={{
          backgroundImage: 'linear-gradient(180deg, rgb(110, 160, 175), rgb(15, 40, 60))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh', //bør få denne til å scale
        }}
      >
        <Card title="User profile">
          <Row>
            <Column>Username: {this.user}</Column>
            <Column>Licks: {this.likkAmount}</Column>
            <Column right>Comments: {this.commentAmount}</Column>
          </Row>
          <Row>
            <Column>Usertype: {this.userType}</Column>
            <Column>Upvotes: {this.upvoteAmount}</Column>
            <Column right>Best comments: {this.bestCommentAmount}</Column>
          </Row>
          <Column>
            <Button.Light>
              <NavBar.Link to="/">Favorite Posts</NavBar.Link>
            </Button.Light>
            <Button.Light>
              <NavBar.Link to="/">Best Post</NavBar.Link>
            </Button.Light>
            <Button.Light>
              <NavBar.Link to="/">Best Comment</NavBar.Link>
            </Button.Light>
            <Button.Light>
              <NavBar.Link to="/">Favorite Comments</NavBar.Link>
            </Button.Light>
            <Button.Light>
              <NavBar.Link to="/">All Posts</NavBar.Link>
            </Button.Light>
            <Button.Light>
              <NavBar.Link to="/">All Comments</NavBar.Link>
            </Button.Light>
          </Column>
        </Card>
      </div>
    );
  }
}
// må bare ha en endring for prettier

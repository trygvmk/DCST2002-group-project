import axios from 'axios';
import pool from '../src/mysql-pool';
import app from '../src/app';
import taskService, { Question, Comment } from '../src/task-service';

const date = new Date();
const formattedDate = date.toISOString().slice(0, -6);

const testQuestion: Question[] = [
  {
    username: 'batman',
    question_id: 1,
    user_id: 1,
    title: 'Help',
    content: 'I need somebody',
    created_at: formattedDate,
    upvotes: 0,
    downvotes: 0,
    karma: 0,
  },
  {
    username: 'robin',
    question_id: 2,
    user_id: 2,
    title: 'Yesterday',
    content: 'I believe in yesterday',
    created_at: formattedDate,
    upvotes: 0,
    downvotes: 0,
    karma: 0,
  },
  {
    username: 'alfred',
    question_id: 3,
    user_id: 3,
    title: 'Hey Jude',
    content: 'Dont be afraid',
    created_at: formattedDate,
    upvotes: 0,
    downvotes: 0,
    karma: 0,
  },
];

axios.defaults.baseURL = 'http://localhost:3001/api/v2';

let webServer: any;
beforeAll((done) => {
  // Use separate port for testing
  webServer = app.listen(3001, () => done());
});

beforeEach((done) => {
  //Slett alle questions, og reset id auto-increment startverdi
  pool.query('TRUNCATE TABLE question', (error) => {
    if (error) return done(error);

    // Create testQuestions sequentially in order to set correct id, and call done() when finished
    taskService
      .questionCreate(
        testQuestion[0].user_id,
        testQuestion[0].title,
        testQuestion[0].content,
        testQuestion[0].username,
      )
      .then(() =>
        taskService.questionCreate(
          testQuestion[1].user_id,
          testQuestion[1].title,
          testQuestion[1].content,
          testQuestion[1].username,
        ),
      ) // Create testQuestion[1] after testQuestion[0] has been created
      .then(() =>
        taskService.questionCreate(
          testQuestion[2].user_id,
          testQuestion[2].title,
          testQuestion[2].content,
          testQuestion[2].username,
        ),
      ) // Create testQuestion[2] after testQuestion[1] has been created
      .then(() => done()); // Call done() after testQuestion[2] has been created
  });
});

// Stop web server and close connection to MySQL server
afterAll((done) => {
  if (!webServer) return done(new Error());
  webServer.close(() => pool.end(() => done()));
});

describe('Fetch posts (GET)', () => {
  //Tester om den kan hente alle posts
  test('Fetch all posts (200 OK)', (done) => {
    axios.get('/posts').then((response) => {
      expect(response.status).toEqual(200);
      expect(response.data).toEqual(testQuestion);
      done();
    });
  });

  test('Fetch post (200 OK)', (done) => {
    axios.get('/posts/1').then((response) => {
      expect(response.status).toEqual(200);
      expect(response.data).toEqual(testQuestion[0]);
      done();
    });
  });

  test('Failing to fetch post that doesnt exitst (404 Not Found)', (done) => {
    axios
      .get('/posts/4')
      .then((_response) => done(new Error()))
      .catch((error) => {
        expect(error.message).toEqual('Request failed with status code 404');
        done();
      });
  });
});

describe('Create new post (POST)', () => {
  test('Create new post (200 OK)', (done) => {
    axios
      .post('/createPost', { user_id: 1, title: 'morsomt', content: 'dekmfe', username: 'batman' })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.data).toEqual({ id: 4 });
        done();
      });
  });
});

describe('Delete post (DELETE)', () => {
  test('Delete post (200 OK)', (done) => {
    axios.delete('/tasks/2').then((response) => {
      expect(response.status).toEqual(200);
      done();
    });
  });
});

/*
const testComment: Comment = {
  username: 'batman',
  user_pfp:
    'https://ichef.bbci.co.uk/news/1536/cpsprodpb/bc74/live/1b7fa100-2d0c-11ed-b970-ff268dbbad44.jpg',
  answer_id: 1,
  best_answer: false,
  content: 'Beste RB i verden',
  created_at: formattedDate,
  upvotes: 0,
  downvotes: 0,
  karma: 0,
};

describe('Fetch comments (GET)', () => {
  //Tester om den kan hente alle posts
  test('Fetch all comments (200 OK)', (done) => {
    axios.get('/posts').then((response) => {
      expect(response.status).toEqual(200);
      expect(response.data).toEqual(testQuestion);
      done();
    });
  });
});
*/

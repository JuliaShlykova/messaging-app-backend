if (process.env.NODE_ENV!=='production') {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const dbConnect = require('./configs/db.config');

const roomRouter = require('./routes/roomRoute');
const userRouter = require('./routes/userRoute');
const authRouter = require('./routes/authRoute');

const {initSocket} = require('./socket');

const passport = require('passport');
require('./configs/passport.config')(passport);

const app = express();

app.set('trust proxy', 3)
app.get('/ip', (request, response) => response.send(request.ip))
app.use(cors({
  origin: ["https://messaging-app-frontend-two.vercel.app", "http://localhost:5000"],
  credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(rateLimit({
  widnowMs: 1*60*1000,
  max: 40
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');

app.use(passport.initialize());

app.use('/rooms', roomRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
  res.sendStatus(404);
})

app.use((err, req, res) => {
  console.error(err);

  let error = { message: err.message, status: err.status };

  if (req.app.get("env") === "development") error.stack = err.stack; //trace where an error has been occured

  res.status(err.status || 500).json({ error });
})

const PORT = process.env.PORT || 5000;

dbConnect().then(() => {
  const server = app.listen(PORT, () => {
    console.log('server is listening on port ' + PORT);
  });
  initSocket(server);
})
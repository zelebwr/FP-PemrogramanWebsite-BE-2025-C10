/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-default-export */
import { Router } from 'express';

import { JeopardyController } from './jeopardy/jeopardy.controller';
import { PairOrNoPairController } from './pair-or-no-pair/pair-or-no-pair.controller';
import { QuizController } from './quiz/quiz.controller';

const GameListRouter = Router();

GameListRouter.use('/quiz', QuizController);
GameListRouter.use('/pair-or-no-pair', PairOrNoPairController);
GameListRouter.use('/jeopardy', JeopardyController);

export default GameListRouter;

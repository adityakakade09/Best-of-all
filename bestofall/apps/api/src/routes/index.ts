import { Router } from 'express';
import { authRouter } from './auth';
import { searchRouter } from './search';
import { wishlistRouter } from './wishlist';
import { historyRouter } from './history';
import { addressesRouter } from './addresses';
import { notificationsRouter } from './notifications';
import { adminRouter } from './admin';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/wishlist', wishlistRouter);
apiRouter.use('/history', historyRouter);
apiRouter.use('/addresses', addressesRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/admin', adminRouter);

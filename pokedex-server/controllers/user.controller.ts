import createError = require('http-errors');
import * as jwt from 'jsonwebtoken';
import { authSchema, insertUserSchema, updateUserSchema } from '../helpers/schema-validation';
import Role from '../models/role.model';
import User from '../models/user.model';
import BaseController from './base.controller';

class UserController extends BaseController {

  model = User;

  register = async (req: any, res: any, next: any) => {
    try {
      const validatedBody = await authSchema.validateAsync(req.body);

      const doesExist = await this.model.findOne({ email: validatedBody.email });
      if (doesExist) {
        throw new createError.Conflict(`${validatedBody.email} has already been registered`);
      }

      const user = new this.model(validatedBody);
      const savedUser = await user.save();

      res.status(201).json(savedUser);
    } catch (error) {
      if (error.isJoi === true) {
        error.status = 422;
      }
      next(error);
    }
  }

  login = async (req: any, res: any, next: any) => {
    try {
      const user = await this.model.findOne({ email: req.body.email });
      if (!user) {
        throw new createError.NotFound(`${req.body.email} has not been registered`);
      }

      const isMatched = await user.isPasswordMatched(req.body.password);
      if (!isMatched) {
        throw new createError.Unauthorized('Invalid Email/Password');
      }

      const accessToken = jwt.sign({ user }, process.env.SECRET_ACCESS_TOKEN as string, {
        issuer: 'jojo-pokedex',
        expiresIn: '15m'
      });
      const refreshToken = jwt.sign({ user }, process.env.SECRET_REFRESH_TOKEN as string, {
        issuer: 'jojo-pokedex',
        expiresIn: '1y'
      });
      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      if (error.isJoi === true) {
        return next(new createError.BadRequest('Invalid Email/Password'));
      }
      next(error);
    }
  }

  refreshToken = async (req: any, res: any, next: any) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new createError.BadRequest();
      }

      const decodedToken = jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN as string) as any;
      const user = decodedToken.user;
      const accessToken = jwt.sign({ user }, process.env.SECRET_ACCESS_TOKEN as string, {
        issuer: 'jojo-pokedex',
        expiresIn: '15m'
      });
      const newRefreshToken = jwt.sign({ user }, process.env.SECRET_REFRESH_TOKEN as string, {
        issuer: 'jojo-pokedex',
        expiresIn: '1y'
      });
      res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new createError.Unauthorized());
      }
      next(error);
    }
  }

  insert = async (req: any, res: any, next: any) => {
    try {
      const validatedBody = await insertUserSchema.validateAsync(req.body);

      const role = await Role.findOne({ value: validatedBody.role });
      validatedBody.role = role?._id;

      const savedUser = await new this.model(validatedBody).save();
      const populatedUser = await savedUser.populate('role').execPopulate();
      res.status(201).json(populatedUser);
    } catch (error) {
      if (error.isJoi === true) {
        error.status = 422;
      } else if (error.code === 11000) {
        if (error.keyValue.hasOwnProperty('email')) {
          return next(new createError.Conflict(`${error.keyValue.email} has already been registered`));
        }
      }
      next(error);
    }
  }

  update = async (req: any, res: any, next: any) => {
    try {
      const validatedBody = await updateUserSchema.validateAsync(req.body);

      const role = await Role.findOne({ value: validatedBody.role });
      validatedBody.role = role?._id;

      await this.model.findOneAndUpdate({ _id: req.params.id }, validatedBody);
      res.status(200).send({ success: true });
    } catch (error) {
      if (error.isJoi === true) {
        error.status = 422;
      } else if (error.code === 11000) {
        if (error.keyValue.hasOwnProperty('email')) {
          return next(new createError.Conflict(`${error.keyValue.email} has already been registered`));
        }
      }
      next(error);
    }
  }

}

export default UserController;

'use strict';
const bcrypt = require('bcryptjs');

const {
  Model, Validator
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    // this instance method returns an object with only information that is
    // save to save in a JWT, like id, username, and email (NOT posswords/other
    // sensitive information) (RETURNS OBJECT WITH USER INFO)
    toSafeObject() {
        const { id, username, email } = this; // context will be the User instance
        return { id, username, email };
    }

    // validate password accepts a password string and returns true if there is
    // a match with the User class instance hashedPassword. if there is not a match
    // returns false (RETURNS BOOLEAN)
    validatePassword(password) {
        return bcrypt.compareSync(password, this.hashedPassword.toString());
    }

    // static method that accepts an ID. specifies currentUser scope and returns
    // User with that ID
    static async getCurrentUserById(id) {
        return await User.scope("currentUser").findByPk(id);
    }

    // static method accepts an object with credential and password keys.
    // method searches for a user with the specifed credential (either username or
    // email) and if a match is found, method should validate password by passing it
    // into the instance's .validatePassword() method. if password is valid,
    // method should return the user by using the currentUser scope
    static async login({ credential, password }) {
        const { Op } = require('sequelize');
        const user = await User.scope('loginUser').findOne({
            where: {
                [Op.or]: {
                    username: credential,
                    email: credential
                }
            }
        });
        if (user && user.validatePassword(password)) {
            return await User.scope('currentUser').findByPk(user.id);
        }
    }

    // static signup method: accepts an object with username, email, and password
    // key. hash the password using bcryptjs package's hashSync method. Create a
    // User with the username, email, and hashedPassword. return the created user
    // using the currentUser scope
    static async signup({ username, email, password }) {
        const hashedPassword = bcrypt.hashSync(password);
        const user = await User.create({
            username,
            email,
            hashedPassword
        });
        return await User.scope('currentUser').findByPk(user.id);
    }

    static associate(models) {
      // define association here
    }
  }

  User.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [4, 30],
            isNotEmail(value) {
                // console.log('this should be getting run as part of the validation. \'value\' parameter is:',value);
                if (Validator.isEmail(value)) {
                    // console.log('now this shouldn\'t be getting run... something is wrong...')
                    throw new Error("Username cannot be an email.");
                }
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 256],
            isEmail: true
        }
    },
    hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
            len: [60, 60]
        }
    }
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
        attributes: {
            exclude: ["hashedPassword", "email", "createdAt", "updatedAt"]
        }
    },
    scopes: {
        currentUser: {
            attributes: { exclude: ["hashedPassword"] }
        },
        loginUser: {
            attributes: {}
        }
    }
  });
  return User;
};

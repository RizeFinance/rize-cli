'use strict';

const Proxyquire = require('proxyquire');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

let questions = {};
let prompts = [];

const inquirerStub = {
    prompt: async options => {
        const name = options[0].name;
        prompts.push(name);
        if (questions[name]) {
            const answer = {};
            answer[name] = await questions[name](options[0]);
            return answer;
        }
    }
};

const RizeCli = Proxyquire('../../', {
    inquirer: inquirerStub
});


describe('cli', () => {
    beforeEach(() => {
        questions = {};
        prompts = [];
    });

    describe('create', () => {
        it('Does nothing if no arguments', async () => {
            await RizeCli.start([]);
            expect(prompts.length).to.equal(0);
        });

        it('Confirms to create database and asks what platform', async () => {
            questions.createDB = async () => true;
            questions.database = async () => 'MySQL';
            await RizeCli.start(['', '', 'create']);
            expect(prompts).to.include('createDB');
            expect(prompts).to.include('database');
        });

        it('Defaults to yes on confirmation', async () => {
            questions.createDB = async options => options.default;
            questions.database = async () => 'MySQL';
            await RizeCli.start(['', '', 'create']);
            expect(prompts).to.include('createDB');
            expect(prompts).to.include('database');
        });

        it('Exits on no to confirmation', async () => {
            questions.createDB = async () => false;
            await RizeCli.start(['', '', 'create']);
            expect(prompts).to.include('createDB');
            expect(prompts).to.not.include('database');
        });
    });

    describe('create --database', () => {
        it('Does nothing if no create argument', async () => {
            await RizeCli.start(['', '', '--database']);
            expect(prompts.length).to.equal(0);
        });

        it('Asks what database to use with no confirmation', async () => {
            questions.database = async () => 'MySQL';
            await RizeCli.start(['', '', 'create', '--database']);
            expect(prompts).to.not.include('createDB');
            expect(prompts).to.include('database');
        });
    });
});

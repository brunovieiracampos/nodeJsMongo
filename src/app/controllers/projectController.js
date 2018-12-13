const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');

const Project = require('../models/Project');
const Task = require('../models/Task');

router.use(authMiddleware);

router.get('/', async (req, res) => {

    try {

        const projects = await Project.find().populate(['userId', 'tasks']);

        return res.send({ projects });

    } catch (error) {
        return res.status(400).send({ error: error.message });
    }

});


router.get('/:projectId', async (req, res) => {

    try {

        const project = await Project.findById(req.params.projectId).populate(['userId', 'tasks']);

        if (project == null) {

            return res.status(404).send();

        }

        return res.send({ project });

    } catch (error) {
        return res.status(400).send({ error: error.message });
    }


});

router.post('/', async (req, res) => {
    try {

        const userId = "5c11436478b0311410741671";

        const { title, description, tasks } = req.body;

        const project = await Project.create({ title, description, userId });

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();

            project.tasks.push(projectTask);
        }));

        await project.save();

        return res.status(201).send({ project });

    } catch (err) {
        return res.status(400).send({ error: err.message });
    }

});

router.put('/:projectId', async (req, res) => {
    try {
        const { title, description, tasks } = req.body;

        const project = await Project.findByIdAndUpdate(req.params.projectId,
            {
                title,
                description
            }, { new: true });

        project.tasks = [];

        await Task.remove({ project: project._id });

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();

            project.tasks.push(projectTask);
        }));

        await project.save();

        return res.status(201).send({ project });

    } catch (err) {
        return res.status(400).send({ error: err.message });
    }

});

router.delete('/:projectId', async (req, res) => {
    try {

        await Project.findByIdAndRemove(req.params.projectId);

        return res.status(204).send();

    } catch (err) {
        return res.status(400).send({ error: err.message });
    }
});



module.exports = app => app.use('/projects', router);
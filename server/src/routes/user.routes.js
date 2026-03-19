router.get('/users', getUsers);
router.post('/users', createUsers);
router.put('/users/:id', updateUsers);
router.delete('/users/:id', deleteUsers);
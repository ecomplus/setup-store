const github = require('./Github')
const gotrue = require('./Gotrue')
const gitgateway = require('./GitGateway')
const netlify = require('./Nelify')

const deploy = (req, res) => {
  github.getRepoName(req.body)
    .then(repoName => {
      req.body.name = repoName
      Promise.all([
        github.deploy(req.body),
        gotrue.deploy(req.body),
        gitgateway.deploy(req.body),
        netlify.deploy(req.body)
      ])
        .then(responses => {
          res.json({
            github: responses[0],
            gotrue: responses[1],
            gitgateway: responses[2],
            netlify: responses[3]
          })
        })
        .catch(error => {
          res.status(error.status || 500).json(error)
        })
    }).catch(error => {
      res.status(error.status || 500).json(error)
    })
}

module.exports = deploy

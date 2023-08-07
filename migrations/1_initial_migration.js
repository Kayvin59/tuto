const TasksList = artifacts.require('./TasksList.sol')

module.exports = function (deployer) {
  deployer.deploy(TasksList)
}

const PublicBubble = artifacts.require('../contracts/PublicBubble.sol');

module.exports = function (deployer) {
  deployer.deploy(PublicBubble)
}

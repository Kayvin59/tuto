// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AccessControlledStorage.sol";
import "./AccessControlBits.sol";


contract PublicBubble is AccessControlledStorage{

  address owner = msg.sender;
  bool terminated = false;

  function getAccessPermissions( address /* user */, uint256 /* contentId */ ) override external view returns (uint256) {

        /**
         * If the bubble has been terminated, the off-chain storage service will delete the bubble and 
         * all its contents.
         */
        if (terminated) return BUBBLE_TERMINATED_BIT;

        /**
         * File 0 is a special file that represents the root of the bubble. Only users with write permission 
         * to file 0 can construct the bubble on an off-chain storage service.
         */
        // else if (contentId == 0 && user != owner) return NO_PERMISSIONS;

        /**
         * All files within the bubble are public.  Anyone can read, write and append.
         */
        else return READ_BIT | WRITE_BIT | APPEND_BIT;
  }

    // Owner can terminate the bubble forcing the off-chain storage service to delete the bubble and its contents
    function terminate() external {
        require(msg.sender == owner, "permission denied");
        terminated = true;
    }

}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ICalculator.sol";
import "./MathLibrary.sol";

abstract contract AbstractCalculator is ICalculator {
    using MathLibrary for uint256;

    function add(
        uint256 a,
        uint256 b
    ) public pure virtual override returns (uint256) {
        return a.add(b);
    }

    function subtract(
        uint256 a,
        uint256 b
    ) public pure virtual override returns (uint256) {
        return a.subtract(b);
    }

    function multiply(
        uint256 a,
        uint256 b
    ) public pure virtual override returns (uint256) {
        return a.multiply(b);
    }

    function divide(
        uint256 a,
        uint256 b
    ) public pure virtual override returns (uint256) {
        return a.divide(b);
    }
}

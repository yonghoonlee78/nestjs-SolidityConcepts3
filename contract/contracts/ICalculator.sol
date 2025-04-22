// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICalculator {
    function add(uint256 a, uint256 b) external pure returns (uint256);
    function subtract(uint256 a, uint256 b) external pure returns (uint256);
    function multiply(uint256 a, uint256 b) external pure returns (uint256);
    function divide(uint256 a, uint256 b) external pure returns (uint256);
}

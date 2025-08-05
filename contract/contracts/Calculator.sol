// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AbstractCalculator.sol";

contract Calculator is AbstractCalculator {
    
    // LastResult struct 정의
    struct LastResult {
        uint256 a;
        uint256 b;
        uint256 result;
        string operation;
    }
    
    // 각 주소별 계산 히스토리를 저장하는 mapping
    mapping(address => LastResult[]) public history;
    
    // Calculate 이벤트 정의 (결과값만 포함)
    event Calculate(uint256 result);
    
    // 계산 함수
    function calculate(uint256 a, uint256 b, string memory operation) public {
        uint256 result;
        
        // 연산 타입에 따른 계산 수행
        if (keccak256(abi.encodePacked(operation)) == keccak256(abi.encodePacked("add"))) {
            result = add(a, b);
        } else if (keccak256(abi.encodePacked(operation)) == keccak256(abi.encodePacked("subtract"))) {
            result = subtract(a, b);
        } else if (keccak256(abi.encodePacked(operation)) == keccak256(abi.encodePacked("multiply"))) {
            result = multiply(a, b);
        } else if (keccak256(abi.encodePacked(operation)) == keccak256(abi.encodePacked("divide"))) {
            result = divide(a, b);
        } else {
            revert("Invalid operation");
        }
        
        // 계산 결과를 히스토리에 추가
        history[msg.sender].push(LastResult({
            a: a,
            b: b,
            result: result,
            operation: operation
        }));
        
        // Calculate 이벤트 발생 (결과값만)
        emit Calculate(result);
    }
    
    // 특정 주소의 마지막 계산 결과 조회
    function getLastResult(address user) public view returns (LastResult memory) {
        require(history[user].length > 0, "No calculation history");
        return history[user][history[user].length - 1];
    }
    
    // 특정 주소의 전체 히스토리 배열 조회
    function getHistoryItem(address user) public view returns (LastResult[] memory) {
        require(history[user].length > 0, "No calculation history");
        return history[user];
    }
    
    // 히스토리 길이 조회
    function getHistoryLength(address user) public view returns (uint256) {
        return history[user].length;
    }
}
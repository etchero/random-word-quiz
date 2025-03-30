/**
 * 안동 영어종결센터 Word Random Test
 * 영어단어와 한국어 뜻을 입력받아 퀴즈를 생성하고 결과를 저장하는 웹 애플리케이션
 */

// DOM 요소들을 미리 선택
document.addEventListener('DOMContentLoaded', function() {
  // 버튼 이벤트 리스너 등록
  document.getElementById('startButton').addEventListener('click', startTest);
  document.getElementById('restartButton').addEventListener('click', restartTest);
  document.getElementById('retryWrongButton').addEventListener('click', retryWrongQuestions);
  
  // localStorage에서 이전에 입력한 단어 불러오기 (요구사항 14)
  loadSavedWords();
});

// 전역 변수 선언
let englishWords = [];       // 영어 단어 배열
let koreanWords = [];        // 한국어 뜻 배열
let questions = [];          // 생성된 문제 배열
let currentQuestionIndex = 0; // 현재 문제 인덱스
let score = 0;               // 점수
let timerInterval;           // 타이머 인터벌
let timeLeft = 6;            // 남은 시간
let wrongAnswers = [];       // 오답 저장 배열

/**
 * localStorage에서 이전에 입력한 단어 불러오기
 */
function loadSavedWords() {
  const savedEnglish = localStorage.getItem('wordTestEnglishWords');
  const savedKorean = localStorage.getItem('wordTestKoreanWords');
  
  if (savedEnglish) {
    document.getElementById('englishWords').value = savedEnglish;
  }
  
  if (savedKorean) {
    document.getElementById('koreanWords').value = savedKorean;
  }
}

/**
 * 테스트 시작 함수
 */
function startTest() {
  // 입력값 가져오기
  const engText = document.getElementById('englishWords').value;
  const korText = document.getElementById('koreanWords').value;
  const name = document.getElementById('userName').value || "Guest";
  
  // 단어들을 슬래시(/)로 구분하여 배열로 변환
  englishWords = engText.split('/').map(word => word.trim()).filter(word => word !== "");
  koreanWords = korText.split('/').map(word => word.trim()).filter(word => word !== "");
  
  // 입력값 localStorage에 저장 (요구사항 14)
  localStorage.setItem('wordTestEnglishWords', engText);
  localStorage.setItem('wordTestKoreanWords', korText);
  
  // 유효성 검사
  if (englishWords.length !== koreanWords.length || englishWords.length === 0) {
    alert("영어단어와 한국어 뜻의 수가 일치하지 않거나 비어있습니다.");
    return;
  }
  
  // 상태 초기화
  currentQuestionIndex = 0;
  score = 0;
  wrongAnswers = [];
  
  // 문제 생성
  generateQuestions();
  
  // 화면 전환
  document.getElementById('inputScreen').classList.add('hidden');
  document.getElementById('quizSection').classList.remove('hidden');
  document.getElementById('resultSection').classList.add('hidden');
  
  // 첫 문제 표시
  nextQuestion();
}

/**
 * 문제 생성 함수 (요구사항 6, 7, 8)
 */
function generateQuestions() {
  const totalWords = englishWords.length;
  let indices = Array.from({length: totalWords}, (_, i) => i);
  let engToKorIndices = [];
  let korToEngIndices = [];
  
  // 50개 미만이면 모든 단어 사용, 그렇지 않으면 25개씩 랜덤 선택
  if (totalWords < 50) {
    // 50개 미만: 모든 단어를 양방향으로 출제
    engToKorIndices = [...indices];
    korToEngIndices = [...indices];
  } else {
    // 50개 이상: 영→한 25개, 한→영 25개 랜덤 선택 (중복 없이)
    engToKorIndices = getRandomUniqueIndices(indices, 25);
    const remaining = indices.filter(i => !engToKorIndices.includes(i));
    
    if (remaining.length >= 25) {
      korToEngIndices = getRandomUniqueIndices(remaining, 25);
    } else {
      korToEngIndices = [...remaining];
    }
  }
  
  // 문제 생성
  questions = [];
  
  // 영어→한국어 문제 생성
  engToKorIndices.forEach(i => {
    questions.push({
      type: 'engToKor',
      question: englishWords[i],
      answer: koreanWords[i]
    });
  });
  
  // 한국어→영어 문제 생성
  korToEngIndices.forEach(i => {
    questions.push({
      type: 'korToEng',
      question: koreanWords[i],
      answer: englishWords[i]
    });
  });
  
  // 문제 순서 섞기
  questions = shuffleArray(questions);
}

/**
 * 중복 없는 랜덤 인덱스 배열 생성 함수
 */
function getRandomUniqueIndices(arr, count) {
  let copy = [...arr];
  let result = [];
  
  for (let i = 0; i < count; i++) {
    if(copy.length === 0) break;
    const randIndex = Math.floor(Math.random() * copy.length);
    result.push(copy[randIndex]);
    copy.splice(randIndex, 1);
  }
  
  return result;
}

/**
 * 배열을 섞는 함수 (Fisher-Yates 알고리즘)
 */
function shuffleArray(array) {
  let currentIndex = array.length;
  let temporaryValue, randomIndex;
  
  // 요소가 남아있는 동안
  while (currentIndex !== 0) {
    // 남은 요소 중 하나를 무작위로 선택
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    
    // 현재 요소와 선택된 요소를 교환
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  
  return array;
}

/**
 * 다음 문제 표시 함수
 */
function nextQuestion() {
  // 모든 문제를 다 풀었으면 결과 화면으로
  if (currentQuestionIndex >= questions.length) {
    endTest();
    return;
  }
  
  // 타이머 초기화
  timeLeft = 6;
  document.getElementById('timer').textContent = timeLeft;
  
  // 문제 번호 표시 (1번부터)
  document.getElementById('questionNumber').textContent = "문제 " + (currentQuestionIndex + 1) + "번";
  
  // 현재 문제 가져오기
  const currentQuestion = questions[currentQuestionIndex];
  
  // 문제 표시
  document.getElementById('question').textContent = 
    (currentQuestion.type === 'engToKor' ? "영어: " : "한국어: ") + currentQuestion.question;
  
  // 5개의 선택지 생성 (정답 포함)
  let choices = [currentQuestion.answer];
  
  // 4개의 오답 선택지 추가
  while (choices.length < 5) {
    const rand = Math.floor(Math.random() * englishWords.length);
    let fakeAnswer = currentQuestion.type === 'engToKor' ? koreanWords[rand] : englishWords[rand];
    
    // 중복 방지
    if (!choices.includes(fakeAnswer)) {
      choices.push(fakeAnswer);
    }
  }
  
  // 선택지 순서 섞기
  choices = shuffleArray(choices);
  
  // 선택지 표시
  const numbering = ["①", "②", "③", "④", "⑤"];
  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = "";
  
  choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.textContent = numbering[index] + " " + choice;
    btn.addEventListener('click', () => checkAnswer(choice));
    choicesDiv.appendChild(btn);
  });
  
  // 타이머 시작
  startTimer();
}

/**
 * 타이머 시작 함수
 */
function startTimer() {
  clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      checkAnswer(null); // 시간 초과시 null 선택으로 처리
    }
  }, 1000);
}

/**
 * 답변 확인 함수
 */
function checkAnswer(selected) {
  clearInterval(timerInterval);
  
  const currentQuestion = questions[currentQuestionIndex];
  const choicesButtons = document.querySelectorAll('#choices button');
  
  // 모든 선택지 검사하여 정답/오답 표시
  choicesButtons.forEach(btn => {
    const btnText = btn.textContent.slice(2).trim(); // 번호 제외한 텍스트 추출
    
    if (btnText === currentQuestion.answer) {
      // 정답 표시
      btn.style.backgroundColor = '#4CAF50';
      btn.style.color = 'white';
      btn.style.borderColor = '#4CAF50';
    } else if (btnText === selected) {
      // 오답 표시
      btn.style.backgroundColor = '#F44336';
      btn.style.color = 'white';
      btn.style.borderColor = '#F44336';
    }
  });
  
  // 점수 계산
  if (selected === currentQuestion.answer) {
    score++;
  } else {
    // 오답 정보 저장 (요구사항 12)
    wrongAnswers.push({
      type: currentQuestion.type,
      question: currentQuestion.question,
      answer: currentQuestion.answer,
      chosen: selected || "시간 초과"
    });
  }
  
  // 다음 문제로 진행 (약간의 딜레이 주기)
  currentQuestionIndex++;
  setTimeout(nextQuestion, 1000);
}

/**
 * 테스트 종료 함수
 */
function endTest() {
  clearInterval(timerInterval);
  
  // 화면 전환
  document.getElementById('quizSection').classList.add('hidden');
  document.getElementById('resultSection').classList.remove('hidden');
  
  // 점수 계산 및 메시지 설정
  let percentage = Math.round((score / questions.length) * 100);
  let message = "";
  
  // 점수대별 피드백 메시지 (요구사항 15)
  if (percentage === 100) {
    message = "대박! 아주 훌륭해요!";
  } else if (percentage >= 90 && percentage <= 98) {
    message = "잘했어요! ★표시 누적하며 다시!";
  } else if (percentage >= 80 && percentage <= 89) {
    message = "아쉽네요! 처음부터 복습하며 ★표기부터 다시!";
  } else {
    message = "암기가 많이 부족합니다. 다시 힘내봅시다!";
  }
  
  // 결과 표시
  document.getElementById('finalScore').innerHTML = 
    `<p>최종 점수: ${percentage}%</p>` +
    `<p>정답: ${score} / ${questions.length}</p>` +
    `<p>${message}</p>` +
    `<p>한번 더 치세요!</p>`;
  
  // 테스트 결과 저장 (요구사항 11)
  saveTestResult(percentage);
  
  // 오답 리뷰 표시 (요구사항 12)
  showReview();
}

/**
 * 테스트 결과 저장 함수
 */
function saveTestResult(percentage) {
  const userName = document.getElementById('userName').value || "Guest";
  const now = new Date();
  
  const result = {
    name: userName,
    percentage: percentage,
    correct: score,
    total: questions.length,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString()
  };
  
  // localStorage에서 기존 결과 불러오기
  let results = JSON.parse(localStorage.getItem('wordTestResults')) || [];
  
  // 새 결과 추가
  results.push(result);
  
  // localStorage에 저장
  localStorage.setItem('wordTestResults', JSON.stringify(results));
}

/**
 * 오답 리뷰 표시 함수
 */
function showReview() {
  const reviewSection = document.getElementById('reviewSection');
  reviewSection.innerHTML = "";
  
  // 오답이 없으면 메시지 표시
  if (wrongAnswers.length === 0) {
    reviewSection.innerHTML = "<p>모든 문제를 맞추셨어요! 완벽합니다!</p>";
    return;
  }
  
  // 각 오답에 대한 정보 표시
  wrongAnswers.forEach((item, index) => {
    const reviewItem = document.createElement('div');
    reviewItem.className = 'review-item';
    
    reviewItem.innerHTML = 
      `<strong>${index + 1}.</strong> 문제: ` +
      `${item.type === 'engToKor' ? '영어' : '한국어'}: ${item.question}<br>` +
      `선택한 답: <span style="color: #F44336;">${item.chosen}</span><br>` +
      `정답: <span style="color: #4CAF50;">${item.answer}</span>`;
    
    reviewSection.appendChild(reviewItem);
  });
}

/**
 * 처음으로 돌아가기 함수 (요구사항 14)
 */
function restartTest() {
  // 화면 전환
  document.getElementById('inputScreen').classList.remove('hidden');
  document.getElementById('quizSection').classList.add('hidden');
  document.getElementById('resultSection').classList.add('hidden');
  
  // 상태 초기화 (입력값은 유지)
  currentQuestionIndex = 0;
  score = 0;
  wrongAnswers = [];
}

/**
 * 오답 다시 풀기 함수 (요구사항 13)
 */
function retryWrongQuestions() {
  // 오답이 없으면 알림
  if (wrongAnswers.length === 0) {
    alert("다시 복습할 오답이 없습니다!");
    return;
  }
  
  // 오답을 새로운 문제로 변환
  questions = wrongAnswers.map(item => ({
    type: item.type,
    question: item.question,
    answer: item.answer
  }));
  
  // 상태 초기화
  currentQuestionIndex = 0;
  score = 0;
  wrongAnswers = [];
  
  // 화면 전환
  document.getElementById('resultSection').classList.add('hidden');
  document.getElementById('quizSection').classList.remove('hidden');
  
  // 첫 문제 표시
  nextQuestion();
}

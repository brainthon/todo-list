'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  date: Date;
}

export default function TodoList() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Next.js 학습하기", completed: false, date: new Date() },
    { id: 2, text: "TypeScript 복습하기", completed: true, date: new Date() },
    { id: 3, text: "프로젝트 기획안 작성", completed: false, date: new Date() },
  ]);
  const [newTodo, setNewTodo] = useState('');

  const formatDate = (date: Date) => {
    return format(date, 'PPP', { locale: ko });
  };

  const moveDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleAddTodo = () => {
    if (newTodo.trim() === '') return;
    
    const newTodoItem: Todo = {
      id: Date.now(),
      text: newTodo.trim(),
      completed: false,
      date: selectedDate
    };
    
    setTodos([...todos, newTodoItem]);
    setNewTodo('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleToggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const getTodosForDate = (date: Date) => {
    return todos.filter(todo => isSameDay(new Date(todo.date), date));
  };

  const currentTodos = getTodosForDate(selectedDate);
  const completedCount = currentTodos.filter(todo => todo.completed).length;

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const weeks = [];
    let week = [];

    // 첫 주의 시작 부분을 채움
    const firstDay = monthStart.getDay();
    for (let i = 0; i < firstDay; i++) {
      week.push(null);
    }

    // 날짜를 채움
    daysInMonth.forEach((day) => {
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
    });

    // 마지막 주의 나머지 부분을 채움
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);

    return (
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${showCalendar ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentDate(subMonths(currentDate, 1));
                }}
                className="p-1 hover:text-purple-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="font-semibold">
                {format(currentDate, 'yyyy년 MM월', { locale: ko })}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentDate(addMonths(currentDate, 1));
                }}
                className="p-1 hover:text-purple-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
              {weeks.flat().map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="p-2" />;
                }

                const todosForDay = getTodosForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <button
                    key={day.toString()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(day);
                      setShowCalendar(false);
                    }}
                    className={`
                      relative p-2 text-sm rounded-lg transition-colors
                      ${isSelected ? 'bg-purple-100 text-purple-600' : ''}
                      ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      hover:bg-gray-100
                    `}
                  >
                    <span className={todosForDay.length > 0 ? 'font-bold' : ''}>
                      {format(day, 'd')}
                    </span>
                    {todosForDay.length > 0 && (
                      <span className="absolute bottom-0 right-0 text-[10px] font-medium text-purple-600">
                        {todosForDay.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 py-4 sm:py-8 px-2 sm:px-4">
      <div className="w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 헤더 */}
          <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">Todo List</h1>
          </div>

          {/* 날짜 네비게이션 */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => moveDate(-1)}
                className="p-1 sm:p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-base sm:text-lg font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200"
              >
                {formatDate(selectedDate)}
              </button>
              <button 
                onClick={() => moveDate(1)}
                className="p-1 sm:p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* 달력 */}
          {renderCalendar()}

          {/* 입력 폼 */}
          <div className="px-4 sm:px-6 py-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="할 일을 입력하세요"
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button 
                onClick={handleAddTodo}
                className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-semibold text-sm sm:text-base"
              >
                추가
              </button>
            </div>
          </div>

          {/* Todo 목록 */}
          <div className="px-4 sm:px-6 py-4 max-h-[400px] overflow-y-auto">
            <div className="space-y-2 sm:space-y-3">
              {currentTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className={`flex-1 text-sm sm:text-base text-gray-800 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.text}
                  </span>
                  <button 
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 요약 */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
              <span>총 {currentTodos.length}개의 할 일</span>
              <span>완료: {completedCount} / 미완료: {currentTodos.length - completedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
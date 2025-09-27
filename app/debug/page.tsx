'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DebugPage() {
  const router = useRouter();
  const [storageData, setStorageData] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // localStorage의 모든 데이터 읽기
    const data: Record<string, any> = {};
    
    const keys = [
      'abo_latest_result',
      'abo_current_answers',
      'abo_assessment_results',
      'abo_user_demographics'
    ];
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });
    
    setStorageData(data);
  }, []);

  const createTestResult = () => {
    const result = {
      categoryScores: {
        em: Math.random() * 100,
        pe: Math.random() * 100,
        ph: Math.random() * 100,
        or: Math.random() * 100,
        im: Math.random() * 100,
      },
      aboIndex: Math.floor(Math.random() * 100),
      level: ['safe', 'caution', 'warning', 'danger'][Math.floor(Math.random() * 4)] as any,
      timestamp: new Date().toISOString(),
      demographics: {
        gender: '남성',
        ageGroup: '25-29'
      }
    };
    
    setTestResult(result);
    localStorage.setItem('abo_latest_result', JSON.stringify(result));
    console.log('Test result created:', result);
  };

  const goToResult = () => {
    if (testResult) {
      router.push('/result');
    }
  };

  const clearAll = () => {
    const keys = [
      'abo_latest_result',
      'abo_current_answers',
      'abo_assessment_results',
      'abo_user_demographics'
    ];
    
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    setStorageData({});
    setTestResult(null);
    alert('모든 localStorage 데이터가 삭제되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 디버그 페이지</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">테스트 도구</h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={createTestResult}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              테스트 결과 생성
            </button>
            
            <button
              onClick={goToResult}
              disabled={!testResult}
              className={`px-4 py-2 rounded ${
                testResult 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              결과 페이지로 이동
            </button>
            
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              모든 데이터 삭제
            </button>
          </div>
          
          {testResult && (
            <div className="p-4 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-800">
                ✅ 테스트 결과가 생성되었습니다. ABO Index: {testResult.aboIndex}
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">localStorage 상태</h2>
          
          {Object.keys(storageData).length === 0 ? (
            <p className="text-gray-500">localStorage에 저장된 데이터가 없습니다.</p>
          ) : (
            Object.entries(storageData).map(([key, value]) => (
              <div key={key} className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">{key}:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">네비게이션</h2>
          
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              홈으로
            </Link>
            
            <Link
              href="/assessment"
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              진단 페이지
            </Link>
            
            <Link
              href="/result"
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              결과 페이지 (직접)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
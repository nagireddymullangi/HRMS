// src/utils/apiTest.ts
// Run in browser console to test APIs

export const testAllApis = async () => {
  const results: Record<string, string> = {};

  // Test Auth
  try {
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: 'superadmin',
        password: 'Admin@123',
      }),
    });
    const data = await res.json();
    results['AUTH LOGIN'] = data.success ? '✅ PASS' : '❌ FAIL';

    const token = data.data?.accessToken;
    if (token) {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Test Employee
      const empRes = await fetch(
        'http://localhost:8080/api/employees', { headers }
      );
      const empData = await empRes.json();
      results['EMPLOYEE LIST'] =
        empData.success ? '✅ PASS' : '❌ FAIL';

      // Test Departments
      const deptRes = await fetch(
        'http://localhost:8080/api/departments', { headers }
      );
      const deptData = await deptRes.json();
      results['DEPARTMENT LIST'] =
        deptData.success ? '✅ PASS' : '❌ FAIL';

      // Test Attendance
      const attRes = await fetch(
        'http://localhost:8080/api/attendance/today/overview',
        { headers }
      );
      const attData = await attRes.json();
      results['ATTENDANCE OVERVIEW'] =
        attData.success ? '✅ PASS' : '❌ FAIL';

      // Test Leaves
      const lvRes = await fetch(
        'http://localhost:8080/api/leaves/summary', { headers }
      );
      const lvData = await lvRes.json();
      results['LEAVE SUMMARY'] =
        lvData.success ? '✅ PASS' : '❌ FAIL';

      // Test Payroll
      const prRes = await fetch(
        'http://localhost:8080/api/payroll/summary?month=3&year=2024',
        { headers }
      );
      const prData = await prRes.json();
      results['PAYROLL SUMMARY'] =
        prData.success ? '✅ PASS' : '❌ FAIL';

      // Test Performance
      const perfRes = await fetch(
        'http://localhost:8080/api/performance/summary', { headers }
      );
      const perfData = await perfRes.json();
      results['PERFORMANCE SUMMARY'] =
        perfData.success ? '✅ PASS' : '❌ FAIL';
    }
  } catch (e) {
    results['CONNECTION'] = '❌ FAIL - Backend not running';
  }

  console.table(results);
  return results;
};
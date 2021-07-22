import { default as assert } from 'assert';
import { parseIssueExpressionOutput, sanitizeIssueTitle, ISSUE_OR_URL_EXPRESSION } from '../../issues/util';

describe('Issues utilities', function () {
	it('regular expressions', async function () {
		const issueNumber = '#1234';
		const issueNumberParsed = parseIssueExpressionOutput(issueNumber.match(ISSUE_OR_URL_EXPRESSION));
		assert.strictEqual(issueNumberParsed?.issueNumber, 1234);
		assert.strictEqual(issueNumberParsed?.commentNumber, undefined);
		assert.strictEqual(issueNumberParsed?.name, undefined);
		assert.strictEqual(issueNumberParsed?.owner, undefined);

		const issueNumberGH = 'GH-321';
		const issueNumberGHParsed = parseIssueExpressionOutput(issueNumberGH.match(ISSUE_OR_URL_EXPRESSION));
		assert.strictEqual(issueNumberGHParsed?.issueNumber, 321);
		assert.strictEqual(issueNumberGHParsed?.commentNumber, undefined);
		assert.strictEqual(issueNumberGHParsed?.name, undefined);
		assert.strictEqual(issueNumberGHParsed?.owner, undefined);
		const issueSingleDigit = '#1';
		const issueSingleDigitParsed = parseIssueExpressionOutput(issueSingleDigit.match(ISSUE_OR_URL_EXPRESSION));
		assert.strictEqual(issueSingleDigitParsed?.issueNumber, 1);
		assert.strictEqual(issueSingleDigitParsed?.commentNumber, undefined);
		assert.strictEqual(issueSingleDigitParsed?.name, undefined);
		assert.strictEqual(issueSingleDigitParsed?.owner, undefined);
		const issueRepo = 'alexr00/myRepo#234';
		const issueRepoParsed = parseIssueExpressionOutput(issueRepo.match(ISSUE_OR_URL_EXPRESSION));
		assert.strictEqual(issueRepoParsed?.issueNumber, 234);
		assert.strictEqual(issueRepoParsed?.commentNumber, undefined);
		assert.strictEqual(issueRepoParsed?.name, 'myRepo');
		assert.strictEqual(issueRepoParsed?.owner, 'alexr00');
		const issueUrl = 'http://github.com/alexr00/myRepo/issues/567';
		const issueUrlParsed = parseIssueExpressionOutput(issueUrl.match(ISSUE_OR_URL_EXPRESSION));
		assert.strictEqual(issueUrlParsed?.issueNumber, 567);
		assert.strictEqual(issueUrlParsed?.commentNumber, undefined);
		assert.strictEqual(issueUrlParsed?.name, 'myRepo');
		assert.strictEqual(issueUrlParsed?.owner, 'alexr00');
		const commentUrl = 'https://github.com/microsoft/vscode/issues/96#issuecomment-641150523';
		const commentUrlParsed = parseIssueExpressionOutput(commentUrl.match(ISSUE_OR_URL_EXPRESSION));
		assert.strictEqual(commentUrlParsed?.issueNumber, 96);
		assert.strictEqual(commentUrlParsed?.commentNumber, 641150523);
		assert.strictEqual(commentUrlParsed?.name, 'vscode');
		assert.strictEqual(commentUrlParsed?.owner, 'microsoft');
		const notIssue = '#a4';
		const notIssueParsed = parseIssueExpressionOutput(notIssue.match(ISSUE_OR_URL_EXPRESSION));
		assert.strictEqual(notIssueParsed, undefined);
	});

	describe('sanitizeIssueTitle', () => {
		[
			{ input: 'Issue', expected: 'Issue' },
			{ input: 'Issue A', expected: 'Issue-A' },
			{ input: 'Issue  A', expected: 'Issue-A' },
			{ input: 'Issue     A', expected: 'Issue-A' },
			{ input: 'Issue @ A', expected: 'Issue-A' },
			{ input: "Issue 'A'", expected: 'Issue-A' },
			{ input: 'Issue "A"', expected: 'Issue-A' },
			{ input: '@Issue "A"', expected: 'Issue-A' },
			{ input: 'Issue "A"%', expected: 'Issue-A' },
			{ input: 'Issue .A', expected: 'Issue-A' },
			{ input: 'Issue ,A', expected: 'Issue-A' },
			{ input: 'Issue :A', expected: 'Issue-A' },
			{ input: 'Issue ;A', expected: 'Issue-A' },
			{ input: 'Issue ~A', expected: 'Issue-A' },
			{ input: 'Issue #A', expected: 'Issue-A' },
		].forEach(testCase => {
			it(`Transforms '${testCase.input}' into '${testCase.expected}'`, () => {
				const actual = sanitizeIssueTitle(testCase.input);
				assert.strictEqual(actual, testCase.expected);
			});
		});
	});
});

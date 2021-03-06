/*eslint no-unused-expressions: 0, prefer-arrow-callback: 0 */

'use strict';

let parseQueryTerms = require('../lib/commands/search').parseQueryTerms;
let matchSearchQuery = require('../lib/search').matchSearchQuery;
let chai = require('chai');
let expect = chai.expect;
chai.config.includeStack = true;

describe('#parseQueryTerms', function () {
    let uidList = [39, 40, 44, 52, 53, 54, 59, 72];

    describe('<sequence set>', function () {
        it('should detect sequence as first argument', function () {
            expect(parseQueryTerms('1,2,4:6'.split(' '), uidList).query).to.deep.equal([{
                key: 'uid',
                value: [39, 40, 52, 53, 54]
            }]);
        });

        it('should detect sequence as subargument', function () {
            expect(parseQueryTerms('NOT 1,2,4:6'.split(' '), uidList).query).to.deep.equal([{
                key: 'not',
                value: {
                    key: 'uid',
                    value: [39, 40, 52, 53, 54]
                }
            }]);
        });
    });

    it('should handle ALL', function () {
        expect(parseQueryTerms('ALL'.split(' '), uidList).query).to.deep.equal([{
            key: 'all',
            value: true
        }]);
    });

    it('should handle ANSWERED', function () {
        expect(parseQueryTerms('ANSWERED'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Answered',
            exists: true
        }]);
    });

    it('should handle BCC', function () {
        expect(parseQueryTerms('BCC query'.split(' '), uidList).query).to.deep.equal([{
            key: 'header',
            header: 'bcc',
            value: 'query'
        }]);
    });

    it('should handle BEFORE', function () {
        expect(parseQueryTerms('BEFORE 1-Feb-1994'.split(' '), uidList).query).to.deep.equal([{
            key: 'internaldate',
            operator: '<',
            value: '1-Feb-1994'
        }]);
    });

    it('should handle BODY', function () {
        expect(parseQueryTerms('BODY query'.split(' '), uidList).query).to.deep.equal([{
            key: 'body',
            value: 'query'
        }]);
    });

    it('should handle CC', function () {
        expect(parseQueryTerms('CC query'.split(' '), uidList).query).to.deep.equal([{
            key: 'header',
            header: 'cc',
            value: 'query'
        }]);
    });

    it('should handle DELETED', function () {
        expect(parseQueryTerms('DELETED'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Deleted',
            exists: true
        }]);
    });

    it('should handle DRAFT', function () {
        expect(parseQueryTerms('DRAFT'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Draft',
            exists: true
        }]);
    });

    it('should handle FLAGGED', function () {
        expect(parseQueryTerms('FLAGGED'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Flagged',
            exists: true
        }]);
    });

    it('should handle FROM', function () {
        expect(parseQueryTerms('FROM query'.split(' '), uidList).query).to.deep.equal([{
            key: 'header',
            header: 'from',
            value: 'query'
        }]);
    });

    it('should handle HEADER', function () {
        expect(parseQueryTerms('HEADER X-FOO query'.split(' '), uidList).query).to.deep.equal([{
            key: 'header',
            header: 'x-foo',
            value: 'query'
        }]);

        expect(parseQueryTerms(['HEADER', 'X-FOO', null], uidList).query).to.deep.equal([{
            key: 'header',
            header: 'x-foo',
            value: ''
        }]);
    });

    it('should handle KEYWORD', function () {
        expect(parseQueryTerms('KEYWORD $MyFlag'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '$MyFlag',
            exists: true
        }]);
    });

    it('should handle LARGER', function () {
        expect(parseQueryTerms('LARGER 123'.split(' '), uidList).query).to.deep.equal([{
            key: 'size',
            value: 123,
            operator: '>'
        }]);
    });

    describe('MODSEQ', function () {
        it('should handle only required param', function () {
            expect(parseQueryTerms('MODSEQ 123'.split(' '), uidList).query).to.deep.equal([{
                key: 'modseq',
                value: 123
            }]);
        });

        it('should handle optional params', function () {
            expect(parseQueryTerms('MODSEQ "/flags/\\\\draft" all 123'.split(' '), uidList).query).to.deep.equal([{
                key: 'modseq',
                value: 123
            }]);
        });
    });

    it('should handle NEW', function () {
        expect(parseQueryTerms('NEW'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Recent',
            exists: true
        }, {
            key: 'flag',
            value: '\\Seen',
            exists: false
        }]);
    });

    it('should handle NOT', function () {
        expect(parseQueryTerms('NOT ALL'.split(' '), uidList).query).to.deep.equal([{
            key: 'not',
            value: {
                key: 'all',
                value: true
            }
        }]);

        expect(parseQueryTerms('NOT NOT ALL'.split(' '), uidList).query).to.deep.equal([{
            key: 'not',
            value: {
                key: 'not',
                value: {
                    key: 'all',
                    value: true
                }
            }
        }]);
    });

    it('should handle OLD', function () {
        expect(parseQueryTerms('OLD'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Recent',
            exists: false
        }]);
    });

    it('should handle ON', function () {
        expect(parseQueryTerms('ON 1-Feb-1994'.split(' '), uidList).query).to.deep.equal([{
            key: 'internaldate',
            operator: '=',
            value: '1-Feb-1994'
        }]);
    });

    it('should handle OR', function () {
        expect(parseQueryTerms('OR ALL NOT ALL'.split(' '), uidList).query).to.deep.equal([{
            key: 'or',
            value: [{
                key: 'all',
                value: true
            }, {
                key: 'not',
                value: {
                    key: 'all',
                    value: true
                }
            }]
        }]);
    });

    it('should handle RECENT', function () {
        expect(parseQueryTerms('RECENT'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Recent',
            exists: true
        }]);
    });

    it('should handle SEEN', function () {
        expect(parseQueryTerms('SEEN'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Seen',
            exists: true
        }]);
    });

    it('should handle SENTBEFORE', function () {
        expect(parseQueryTerms('SENTBEFORE 1-Feb-1994'.split(' '), uidList).query).to.deep.equal([{
            key: 'date',
            operator: '<',
            value: '1-Feb-1994'
        }]);
    });

    it('should handle SENTON', function () {
        expect(parseQueryTerms('SENTON 1-Feb-1994'.split(' '), uidList).query).to.deep.equal([{
            key: 'date',
            operator: '=',
            value: '1-Feb-1994'
        }]);
    });

    it('should handle SENTSINCE', function () {
        expect(parseQueryTerms('SENTSINCE 1-Feb-1994'.split(' '), uidList).query).to.deep.equal([{
            key: 'date',
            operator: '>=',
            value: '1-Feb-1994'
        }]);
    });

    it('should handle SINCE', function () {
        expect(parseQueryTerms('SINCE 1-Feb-1994'.split(' '), uidList).query).to.deep.equal([{
            key: 'internaldate',
            operator: '>=',
            value: '1-Feb-1994'
        }]);
    });

    it('should handle SMALLER', function () {
        expect(parseQueryTerms('SMALLER 123'.split(' '), uidList).query).to.deep.equal([{
            key: 'size',
            value: 123,
            operator: '<'
        }]);
    });

    it('should handle SUBJECT', function () {
        expect(parseQueryTerms('SUBJECT query'.split(' '), uidList).query).to.deep.equal([{
            key: 'header',
            header: 'subject',
            value: 'query'
        }]);
    });

    it('should handle TEXT', function () {
        expect(parseQueryTerms('TEXT query'.split(' '), uidList).query).to.deep.equal([{
            key: 'text',
            value: 'query'
        }]);
    });

    it('should handle TO', function () {
        expect(parseQueryTerms('TO query'.split(' '), uidList).query).to.deep.equal([{
            key: 'header',
            header: 'to',
            value: 'query'
        }]);
    });

    it('should handle UID', function () {
        expect(parseQueryTerms('UID 44,54:*'.split(' '), uidList).query).to.deep.equal([{
            key: 'uid',
            value: [44, 54, 59, 72]
        }]);
    });

    it('should handle UNANSWERED', function () {
        expect(parseQueryTerms('UNANSWERED'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Answered',
            exists: false
        }]);
    });

    it('should handle UNDELETED', function () {
        expect(parseQueryTerms('UNDELETED'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Deleted',
            exists: false
        }]);
    });

    it('should handle UNDRAFT', function () {
        expect(parseQueryTerms('UNDRAFT'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Draft',
            exists: false
        }]);
    });

    it('should handle UNFLAGGED', function () {
        expect(parseQueryTerms('UNFLAGGED'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Flagged',
            exists: false
        }]);
    });

    it('should handle UNKEYWORD', function () {
        expect(parseQueryTerms('UNKEYWORD $MyFlag'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '$MyFlag',
            exists: false
        }]);
    });

    it('should handle UNSEEN', function () {
        expect(parseQueryTerms('UNSEEN'.split(' '), uidList).query).to.deep.equal([{
            key: 'flag',
            value: '\\Seen',
            exists: false
        }]);
    });

    it('should handle complex query', function () {
        // this is a query by iOS Mail app
        // UID SEARCH (OR FROM "Time" (OR SUBJECT "Time" (OR TO "Time" (OR CC "Time" BODY "Time")))) NOT DELETED
        expect(parseQueryTerms('OR FROM Time OR SUBJECT Time OR TO Time OR CC Time BODY Time NOT DELETED'.split(' '), uidList).query).to.deep.equal([{
            key: 'or',
            value: [{
                key: 'header',
                header: 'from',
                value: 'Time'
            }, {
                key: 'or',
                value: [{
                    key: 'header',
                    header: 'subject',
                    value: 'Time'
                }, {
                    key: 'or',
                    value: [{
                        key: 'header',
                        header: 'to',
                        value: 'Time'
                    }, {
                        key: 'or',
                        value: [{
                            key: 'header',
                            header: 'cc',
                            value: 'Time'
                        }, {
                            key: 'body',
                            value: 'Time'
                        }]
                    }]
                }]
            }]
        }, {
            key: 'not',
            value: {
                key: 'flag',
                value: '\\Deleted',
                exists: true
            }
        }]);
    });
});

describe('Search term match tests', function () {
    describe('AND', function () {
        it('should find all matches', function () {
            expect(matchSearchQuery({}, [{
                key: 'all',
                value: true
            }, {
                key: 'all',
                value: true
            }, {
                key: 'all',
                value: true
            }, {
                key: 'all',
                value: true
            }])).to.be.true;
        });

        it('should fail on single error', function () {
            expect(matchSearchQuery({}, [{
                key: 'all',
                value: true
            }, {
                key: 'all',
                value: true
            }, {
                key: 'all',
                value: true
            }, {
                key: 'flag',
                value: 'zzzzzzz',
                exists: true
            }])).to.be.false;
        });
    });

    describe('OR', function () {
        it('should succeed with at least one match', function () {
            expect(matchSearchQuery({}, {
                key: 'or',
                value: [{
                    key: 'flag',
                    value: 'zzzzzzz',
                    exists: true
                }, {
                    key: 'all',
                    value: true
                }, {
                    key: 'flag',
                    value: 'zzzzzzz',
                    exists: true
                }]
            })).to.be.true;
        });

        it('should fail with no matches', function () {
            expect(matchSearchQuery({}, {
                key: 'or',
                value: [{
                    key: 'flag',
                    value: 'zzzzzzz',
                    exists: true
                }, {
                    key: 'flag',
                    value: 'zzzzzzz',
                    exists: true
                }]
            })).to.be.false;
        });
    });

    describe('NOT', function () {
        it('should succeed with false value', function () {
            expect(matchSearchQuery({}, {
                key: 'not',
                value: {
                    key: 'flag',
                    value: 'zzzzzzz',
                    exists: true
                }
            })).to.be.true;
        });

        it('should fail with thruthy value', function () {
            expect(matchSearchQuery({}, {
                key: 'not',
                value: {
                    key: 'all',
                    value: true
                }
            })).to.be.false;
        });
    });

    describe('ALL', function () {
        it('should match ALL', function () {
            expect(matchSearchQuery({}, {
                key: 'all',
                value: true
            })).to.be.true;
        });
    });

    describe('FLAG', function () {
        it('should match existing flag', function () {
            expect(matchSearchQuery({
                flags: ['abc', 'def', 'ghi']
            }, {
                key: 'flag',
                value: 'def',
                exists: true
            })).to.be.true;
        });

        it('should match non-existing flag', function () {
            expect(matchSearchQuery({
                flags: ['abc', 'def', 'ghi']
            }, {
                key: 'flag',
                value: 'zzzzz',
                exists: false
            })).to.be.true;
        });

        it('should fail non-existing flag', function () {
            expect(matchSearchQuery({
                flags: ['abc', 'def', 'ghi']
            }, {
                key: 'flag',
                value: 'zzzzz',
                exists: true
            })).to.be.false;
        });

        it('should fail existing flag', function () {
            expect(matchSearchQuery({
                flags: ['abc', 'def', 'ghi']
            }, {
                key: 'flag',
                value: 'abc',
                exists: false
            })).to.be.false;
        });
    });

    describe('INTERNALDATE', function () {
        it('should match <', function () {
            expect(matchSearchQuery({
                internaldate: new Date('1999-01-01')
            }, {
                key: 'internaldate',
                value: '2001-01-01',
                operator: '<'
            })).to.be.true;
        });

        it('should not match <', function () {
            expect(matchSearchQuery({
                internaldate: new Date('1999-01-01')
            }, {
                key: 'internaldate',
                value: '1998-01-01',
                operator: '<'
            })).to.be.false;
        });

        it('should match =', function () {
            expect(matchSearchQuery({
                internaldate: new Date('1999-01-01')
            }, {
                key: 'internaldate',
                value: '1999-01-01',
                operator: '='
            })).to.be.true;
        });

        it('should not match <', function () {
            expect(matchSearchQuery({
                internaldate: new Date('1999-01-01')
            }, {
                key: 'internaldate',
                value: '1999-01-02',
                operator: '='
            })).to.be.false;
        });

        it('should match >=', function () {
            expect(matchSearchQuery({
                internaldate: new Date('1999-01-01')
            }, {
                key: 'internaldate',
                value: '1999-01-01',
                operator: '>='
            })).to.be.true;

            expect(matchSearchQuery({
                internaldate: new Date('1999-01-02')
            }, {
                key: 'internaldate',
                value: '1999-01-01',
                operator: '>='
            })).to.be.true;
        });

        it('should not match >=', function () {
            expect(matchSearchQuery({
                internaldate: new Date('1999-01-01')
            }, {
                key: 'internaldate',
                value: '1999-01-02',
                operator: '>='
            })).to.be.false;
        });
    });

    describe('DATE', function () {
        let raw = 'Subject: test\r\nDate: 1999-01-01\r\n\r\nHello world!';

        it('should match <', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'date',
                value: '2001-01-01',
                operator: '<'
            })).to.be.true;
        });

        it('should not match <', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'date',
                value: '1998-01-01',
                operator: '<'
            })).to.be.false;
        });

        it('should match =', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'date',
                value: '1999-01-01',
                operator: '='
            })).to.be.true;
        });

        it('should not match <', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'date',
                value: '1999-01-02',
                operator: '='
            })).to.be.false;
        });

        it('should match >=', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'date',
                value: '1999-01-01',
                operator: '>='
            })).to.be.true;

            expect(matchSearchQuery({
                raw
            }, {
                key: 'date',
                value: '1998-01-01',
                operator: '>='
            })).to.be.true;
        });

        it('should not match >=', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'date',
                value: '1999-01-02',
                operator: '>='
            })).to.be.false;
        });
    });

    describe('BODY', function () {
        let raw = 'Subject: test\r\n\r\nHello world!';

        it('should match a string', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'body',
                value: 'hello'
            })).to.be.true;
        });

        it('should not match a string', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'body',
                value: 'test'
            })).to.be.false;
        });
    });

    describe('TEXT', function () {
        let raw = 'Subject: test\r\n\r\nHello world!';

        it('should match a string', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'text',
                value: 'hello'
            })).to.be.true;

            expect(matchSearchQuery({
                raw
            }, {
                key: 'text',
                value: 'test'
            })).to.be.true;
        });

        it('should not match a string', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'text',
                value: 'zzzzz'
            })).to.be.false;
        });
    });

    describe('UID', function () {
        it('should match message uid', function () {
            expect(matchSearchQuery({
                uid: 123
            }, {
                key: 'uid',
                value: [11, 123, 134]
            })).to.be.true;
        });

        it('should not match message uid', function () {
            expect(matchSearchQuery({
                uid: 124
            }, {
                key: 'uid',
                value: [11, 123, 134]
            })).to.be.false;
        });
    });

    describe('SIZE', function () {
        it('should match <', function () {
            expect(matchSearchQuery({
                raw: new Buffer(10)
            }, {
                key: 'size',
                value: 11,
                operator: '<'
            })).to.be.true;
        });

        it('should not match <', function () {
            expect(matchSearchQuery({
                raw: new Buffer(10)
            }, {
                key: 'size',
                value: 9,
                operator: '<'
            })).to.be.false;
        });

        it('should match =', function () {
            expect(matchSearchQuery({
                raw: new Buffer(10)
            }, {
                key: 'size',
                value: 10,
                operator: '='
            })).to.be.true;
        });

        it('should not match =', function () {
            expect(matchSearchQuery({
                raw: new Buffer(10)
            }, {
                key: 'size',
                value: 11,
                operator: '='
            })).to.be.false;
        });

        it('should match >', function () {
            expect(matchSearchQuery({
                raw: new Buffer(10)
            }, {
                key: 'size',
                value: 9,
                operator: '>'
            })).to.be.true;
        });

        it('should not match <', function () {
            expect(matchSearchQuery({
                raw: new Buffer(10)
            }, {
                key: 'size',
                value: 11,
                operator: '>'
            })).to.be.false;
        });
    });

    describe('header', function () {
        let raw = 'Subject: test\r\n\r\nHello world!';

        it('should match header value', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'header',
                value: 'test',
                header: 'subject'
            })).to.be.true;
        });

        it('should match empty header value', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'header',
                value: '',
                header: 'subject'
            })).to.be.true;
        });

        it('should not match header value', function () {
            expect(matchSearchQuery({
                raw
            }, {
                key: 'header',
                value: 'tests',
                header: 'subject'
            })).to.be.false;
        });
    });

    describe('MODSEQ', function () {
        it('should match equal modseq', function () {
            expect(matchSearchQuery({
                modseq: 500
            }, {
                key: 'modseq',
                value: [500]
            })).to.be.true;
        });

        it('should match greater modseq', function () {
            expect(matchSearchQuery({
                modseq: 1000
            }, {
                key: 'modseq',
                value: [500]
            })).to.be.true;
        });

        it('should not match lesser modseq', function () {
            expect(matchSearchQuery({
                modseq: 500
            }, {
                key: 'modseq',
                value: [100]
            })).to.be.true;
        });
    });
});

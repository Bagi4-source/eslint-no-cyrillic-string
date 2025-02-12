/**
 * @fileoverview Disable cyrillic string literals
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Disable cyrillic string literals",
            category: "Stylistic Issues",
            recommended: false
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    comments: {
                        type: "boolean",
                        default: false
                    },
                    allow: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        default: []
                    }
                },
                additionalProperties: false
            }
        ]
    },

    create(context) {
        const options = context.options[0] || {};
        const allow = options?.allow || [];

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * returns true if string has some symbol of cyrillic alphabet
         * @param {string} text 
         * @returns {boolean}
         */
        function hasCyrillicText(text) {
            if (allow.length > 0) {
                const regexp = new RegExp(`^\\s?(${allow.join('|')})`);
                if (regexp.test(text)) return false;
            }
            return /[а-яё]/i.test(text);
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            Program() {
                if (!options.comments) return;

                for (const comment of context.getAllComments()) {
                    if (hasCyrillicText(comment.value)) {
                        context.report({
                            fix(fixer) {
                                return fixer.remove(comment);
                            },
                            loc: comment.loc,
                            message: "Comments must be without cyrillic text"
                        });
                    }
                }
            },

            Literal(node) {
                const isStringLiteral = (typeof node.value == "string");
                if ( !isStringLiteral ) {
                    return;
                }

                const stringContent = node.value;

                if ( hasCyrillicText(stringContent) ) {
                    context.report({
                        node,
                        message: "Strings must be without cyrillic text"
                    });
                }
            },

            TemplateElement(node) {
                const templateContent = node.value.raw;

                if ( hasCyrillicText(templateContent) ) {
                    context.report({
                        node,
                        message: "Strings must be without cyrillic text"
                    });
                }
            },

            JSXText(node) {
                if ( hasCyrillicText(node.value) ) {
                    context.report({
                        node,
                        message: "Strings must be without cyrillic text"
                    });
                }
            }
        };
    }
};

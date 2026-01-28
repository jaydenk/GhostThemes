/**
 * Ember Theme - Main JavaScript
 */

(function() {
    'use strict';

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        initLinkedPosts();
        initExternalLinks();
        initAppsPage();
    });

    /**
     * Linked posts: rewrite the title link to point to the
     * first external link found in the post body.
     */
    function initLinkedPosts() {
        var linked = document.querySelectorAll('.post-card.tag-hash-linked');

        linked.forEach(function(card) {
            var body = card.querySelector('.post-card-body');
            if (!body) return;

            var firstLink = body.querySelector('a[href]');
            if (!firstLink) return;

            var titleLink = card.querySelector('.post-card-title a');
            if (!titleLink) return;

            titleLink.href = firstLink.href;
            titleLink.setAttribute('target', '_blank');
            titleLink.setAttribute('rel', 'noopener noreferrer');
        });
    }

    /**
     * Apps page: restructure Ghost editor content into grid rows.
     * Convention: h3 = app name, next <p> containing an <a> = URL,
     * remaining <p>s until the next h3 = description.
     */
    function initAppsPage() {
        var container = document.querySelector('.gh-apps-content');
        if (!container) return;

        var elements = container.querySelectorAll('h3, p');
        if (!elements.length) return;

        var entries = [];
        var current = null;

        elements.forEach(function(el) {
            var tag = el.tagName.toLowerCase();

            if (tag === 'h3') {
                current = {
                    name: el.textContent.trim(),
                    url: null,
                    urlText: null,
                    descParts: []
                };
                entries.push(current);
            } else if (current && tag === 'p') {
                var link = el.querySelector('a[href]');

                if (link && !current.url) {
                    // Extract URL from the link
                    current.url = link.href;
                    current.urlText = link.textContent.trim();

                    // Ghost may combine link + description in one <p>
                    // separated by <br>. Extract the text after the <br>.
                    var html = el.innerHTML;
                    var brIndex = html.search(/<br\s*\/?>/i);
                    if (brIndex !== -1) {
                        var afterBr = html.substring(html.indexOf('>', brIndex) + 1).trim();
                        if (afterBr) {
                            current.descParts.push(afterBr);
                        }
                    }
                } else {
                    current.descParts.push(el.innerHTML);
                }
            }
        });

        if (!entries.length) return;

        container.innerHTML = '';

        entries.forEach(function(entry) {
            var row = document.createElement('div');
            row.className = 'app-entry';

            var info = document.createElement('div');
            info.className = 'app-info';

            var name = document.createElement('h3');
            name.className = 'app-name';
            name.textContent = entry.name;
            info.appendChild(name);

            if (entry.url) {
                var urlDiv = document.createElement('div');
                urlDiv.className = 'app-url';
                var a = document.createElement('a');
                a.href = entry.url;
                a.textContent = entry.urlText || entry.url;
                a.setAttribute('target', '_blank');
                a.setAttribute('rel', 'noopener noreferrer');
                urlDiv.appendChild(a);
                info.appendChild(urlDiv);
            }

            row.appendChild(info);

            var desc = document.createElement('div');
            desc.className = 'app-description';
            if (entry.descParts.length) {
                desc.innerHTML = entry.descParts.map(function(part) {
                    return '<p>' + part + '</p>';
                }).join('');
            }
            row.appendChild(desc);

            container.appendChild(row);
        });
    }

    /**
     * Open external links in new tab
     */
    function initExternalLinks() {
        var links = document.querySelectorAll('a[href^="http"]');
        var host = window.location.host;

        links.forEach(function(link) {
            if (link.href.indexOf(host) === -1) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
})();

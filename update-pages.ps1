$dir = "C:\Users\RYAN_MWAKALA\Mwakala's Workspace\Personal\DevOps\Migration Pulse Hub"

# Extract SVG symbol block from index.html
$indexHtml = [System.IO.File]::ReadAllText("$dir\index.html", [System.Text.Encoding]::UTF8)
$svgMatch = [regex]::Match($indexHtml, '(?s)<!-- ={4,}\r?\n     SVG Icon System.*?</svg>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
if (-not $svgMatch.Success) {
    # fallback: grab from <svg to first </svg>
    $svgMatch = [regex]::Match($indexHtml, '(?s)<svg xmlns="http://www\.w3\.org/2000/svg"[^>]*style="display:none".*?</svg>')
}
$svgBlock = $svgMatch.Value
Write-Output "SVG block length: $($svgBlock.Length) chars"

$socialSvg = @'
><svg class="mph-icon" style="width:14px;height:14px"><use href="#ico-linkedin"/></svg></a><a href="#" aria-label="X/Twitter"><svg class="mph-icon" style="width:14px;height:14px"><use href="#ico-twitter"/></svg></a><a href="#" aria-label="Facebook"><svg class="mph-icon" style="width:14px;height:14px"><use href="#ico-facebook"/></svg></a><a href="#" aria-label="Instagram"><svg class="mph-icon" style="width:14px;height:14px"><use href="#ico-instagram"/></svg></a><a href="#" aria-label="YouTube"><svg class="mph-icon" style="width:14px;height:14px"><use href="#ico-youtube"/></svg></a>
'@.Trim()

$pages = @('about.html','our-work.html','impact.html','partners.html','knowledge-hub.html',
           'reports.html','news.html','events.html','team.html','support.html',
           'media.html','privacy.html','contact.html')

foreach ($page in $pages) {
    $file = "$dir\$page"
    $c = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

    # 1. Add upgrade.css if not present
    if ($c -notmatch 'upgrade\.css') {
        $c = $c.Replace(
            '<link rel="stylesheet" href="assets/css/style.css" />',
            '<link rel="stylesheet" href="assets/css/style.css" />' + "`n  " + '<link rel="stylesheet" href="assets/css/upgrade.css" />'
        )
    }

    # 2. Inject SVG block after <body> if not already there
    if ($c -notmatch 'ico-mail') {
        $c = $c.Replace('<body>', "<body>`n`n$svgBlock`n")
    }

    # 3. Header logo: text mark -> image
    $c = $c.Replace(
        '<div class="mph-logo-mark">MPH</div>',
        '<img src="assets/images/logo.png" class="mph-logo-img" alt="Migration Pulse Hub" />'
    )

    # 4. Footer logo: text mark -> image
    $c = $c.Replace(
        '<div class="mph-logo-mark mph-footer-logo">MPH</div>',
        '<img src="assets/images/logo.png" class="mph-footer-logo-img" alt="Migration Pulse Hub" />'
    )

    # 5. Topbar emoji -> SVG
    $c = $c.Replace('📧 <a href="mailto', '<svg class="mph-icon" style="width:14px;height:14px"><use href="#ico-mail"/></svg> <a href="mailto')
    $c = $c.Replace('📞 <a href="tel',   '<svg class="mph-icon" style="width:14px;height:14px"><use href="#ico-phone"/></svg> <a href="tel')
    $c = $c.Replace('📍 Nairobi, Kenya', '<svg class="mph-icon" style="width:14px;height:14px"><use href="#ico-map-pin"/></svg> Nairobi, Kenya')

    # 6. Social icon text -> SVG (topbar & footer)
    $c = $c.Replace('>in</a><a href="#" aria-label="X">𝕏</a><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="Instagram">ig</a><a href="#" aria-label="YouTube">▶</a>', $socialSvg)
    # Alternate quoting in some pages
    $c = $c.Replace('>in</a><a href="#" aria-label="X/Twitter">𝕏</a><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="Instagram">ig</a><a href="#" aria-label="YouTube">▶</a>', $socialSvg)

    # 7. Footer contact emoji -> SVG
    $c = $c.Replace('<span class="ico">📧</span>', '<svg class="mph-icon" style="width:15px;height:15px;color:var(--amber)"><use href="#ico-mail"/></svg>')
    $c = $c.Replace('<span class="ico">📞</span>', '<svg class="mph-icon" style="width:15px;height:15px;color:var(--amber)"><use href="#ico-phone"/></svg>')
    $c = $c.Replace('<span class="ico">📍</span>',  '<svg class="mph-icon" style="width:15px;height:15px;color:var(--amber)"><use href="#ico-map-pin"/></svg>')

    # 8. Back-to-top arrow -> SVG
    $c = $c.Replace('aria-label="Back to top">↑</button>', 'aria-label="Back to top"><svg class="mph-icon"><use href="#ico-trending"/></svg></button>')

    # 9. Card icon emojis -> SVG (inline in mph-card-icon divs)
    $emojiMap = @{
        '🌍' = 'ico-globe';    '🌐' = 'ico-globe'
        '⚖️' = 'ico-scale';   '⚖' = 'ico-scale'
        '🔬' = 'ico-microscope'
        '📣' = 'ico-megaphone'
        '📊' = 'ico-bar-chart'
        '🏛️' = 'ico-landmark'; '🏛' = 'ico-landmark'
        '👥' = 'ico-users';    '🤝' = 'ico-users';  '🎓' = 'ico-users'
        '📅' = 'ico-calendar'
        '🎯' = 'ico-shield'
        '🔭' = 'ico-trending'
        '💛' = 'ico-heart';    '❤️' = 'ico-heart'
        '📜' = 'ico-book';     '📋' = 'ico-book';  '📝' = 'ico-book'; '📖' = 'ico-book'
        '🔍' = 'ico-alert';    '🔎' = 'ico-alert'
        '💡' = 'ico-alert'
        '🔗' = 'ico-link'
        '📰' = 'ico-newspaper'
        '🏆' = 'ico-check';    '🏅' = 'ico-check'; '✅' = 'ico-check'
        '🗺️' = 'ico-map-pin'; '📍' = 'ico-map-pin'
        '✉️' = 'ico-mail'
        '🤝' = 'ico-users'
        '💼' = 'ico-landmark'
        '📞' = 'ico-phone'
        '🧑‍⚖️' = 'ico-gavel'; '⚒️' = 'ico-gavel'
        '🔏' = 'ico-shield';  '🛡️' = 'ico-shield'; '🛡' = 'ico-shield'
        '📈' = 'ico-trending'
        '🌱' = 'ico-globe'
        '🤖' = 'ico-alert'
        '📦' = 'ico-book'
        '🏢' = 'ico-landmark'
    }
    foreach ($emoji in $emojiMap.Keys) {
        $iconId = $emojiMap[$emoji]
        $svg = "<svg class=`"mph-icon mph-icon-lg`"><use href=`"#$iconId`"/></svg>"
        # Only replace inside mph-card-icon divs (target the closing >EMOJI</div>)
        $c = $c.Replace(">$emoji</div>", ">$svg</div>")
        # Also replace where emoji is after >  with newline/space
        $c = $c.Replace("> $emoji</div>", ">$svg</div>")
    }

    [System.IO.File]::WriteAllText($file, $c, [System.Text.Encoding]::UTF8)
    Write-Output "  Updated: $page"
}
Write-Output "Done."

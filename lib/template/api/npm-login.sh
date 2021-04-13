/usr/bin/expect <<EOD
spawn npm login --registry=https://npm.pkg.github.com --scope=@rizefinance
expect {
    "Username:" {send "$GITHUB_USERNAME\r"; exp_continue}
    "Password:" {send "$GITHUB_PASSWORD\r"; exp_continue}
    "Email: (this IS public)" {send "$GITHUB_EMAIL\r"; exp_continue}
}
EOD
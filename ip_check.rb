require 'ipaddr'

if (ARGV.size() != 2)
    exit 1
end

File.foreach(ARGV[1]){|ip|
    ipRange = IPAddr.new(ip.chomp)
    File.foreach(ARGV[0]){|line|
        userID = line.split(",")[0].chomp
        target = line.split(",")[1].chomp
        p userID if ipRange.include?(target)
    }
}

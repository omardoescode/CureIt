package com.cureit.contentprocessing.util;

import com.cureit.contentprocessing.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.net.*;
import java.util.regex.Pattern;

@RequiredArgsConstructor
@Component
public class UrlValidator {
    private static final Pattern ALLOWED_SCHEMES = Pattern.compile("^(http|https)$", Pattern.CASE_INSENSITIVE);

    public boolean isValidUrl(String url) {
        try {
            URI uri = new URI(url);

            if (uri.getScheme() == null || uri.getHost() == null) {
                return false;
            }

            if (!ALLOWED_SCHEMES.matcher(uri.getScheme()).matches()) {
                return false;
            }

            if (isPrivateAddress(uri.getHost())) {
                return false;
            }

            return true;

        } catch (URISyntaxException e) {
            return false;
        }
    }

    private boolean isPrivateAddress(String host) {
        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress address : addresses) {
                if (address.isAnyLocalAddress() ||
                        address.isLoopbackAddress() ||
                        address.isLinkLocalAddress() ||
                        address.isSiteLocalAddress()) {
                    return true;
                }

                String ip = address.getHostAddress();
                if (ip.startsWith("fe80") || ip.startsWith("fc") || ip.startsWith("fd")) {
                    return true;
                }
            }
        } catch (UnknownHostException e) {
            return true;
        }
        return false;
    }

    public boolean isValidImageUrl(String imageUrl) {
        return isValidUrl(imageUrl) && isReachable(imageUrl);
    }

    public boolean isReachable(String url) {
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(3000);
            connection.setReadTimeout(3000);
            connection.setInstanceFollowRedirects(false);

            int code = connection.getResponseCode();
            return code == 200;

        } catch (Exception e) {
            return false;
        }
    }

    public void validateOrThrow(String url) {
        if (!isValidUrl(url)) {
            throw new ApiException("Unsafe or invalid URL: " + url);
        }
    }
}

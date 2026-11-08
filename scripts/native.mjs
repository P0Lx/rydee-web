// Biblioteki natywne w aplikacji - LicenseRegistry ich nie zna, utrzymywane ręcznie
// (android/app/build.gradle.kts, android/uvccamera-lib-patch/build.sh).
const BSD3 = (holder) => `Copyright ${holder}. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`;

const APACHE = 'Licensed under the Apache License, Version 2.0: https://www.apache.org/licenses/LICENSE-2.0';

export const native = [
  { name: 'androidx.health.connect:connect-client', version: '1.1.0', license: 'Apache-2.0', platform: 'Android', text: `Copyright The Android Open Source Project.\n\n${APACHE}` },
  { name: 'Protocol Buffers (w connect-client)', version: '', license: 'BSD-3-Clause', platform: 'Android', text: BSD3('2008 Google Inc.') },
  { name: 'kotlinx-coroutines-android', version: '1.7.3', license: 'Apache-2.0', platform: 'Android', text: `Copyright JetBrains s.r.o. and Kotlin Programming Language contributors.\n\n${APACHE}` },
  { name: 'UVCCamera (org.uvccamera:lib, patched)', version: '0.0.13', license: 'Apache-2.0', platform: 'Android', text: `Copyright UVCCamera contributors.\n\n${APACHE}\n\nModified for Rydee; patches are described in the application repository.` },
  { name: 'libuvc', version: '', license: 'BSD-3-Clause', platform: 'Android', text: BSD3('2010-2015 Ken Tossell') },
  { name: 'libjpeg-turbo', version: '3.2.0', license: 'BSD-3-Clause, IJG, zlib', platform: 'Android', text: 'This software is based in part on the work of the Independent JPEG Group.\n\nFull terms: https://github.com/libjpeg-turbo/libjpeg-turbo/blob/main/LICENSE.md' },
  { name: 'libusb', version: '', license: 'LGPL-2.1-or-later', platform: 'Android', text: 'Copyright libusb contributors. Licensed under the GNU Lesser General Public License, version 2.1 or later: https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html\n\nSource code: https://github.com/libusb/libusb' },
];

export const fonts = [
  { name: 'Bricolage Grotesque', license: 'OFL-1.1', by: 'The Bricolage Grotesque Project Authors' },
  { name: 'Geist, Geist Mono', license: 'OFL-1.1', by: 'Vercel, Basement Studio' },
];
